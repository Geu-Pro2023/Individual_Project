import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageCapture } from "@/components/ui/image-capture";
import { cattleAPI, ownersAPI } from "@/services/api";
import { validatorAPI } from "@/services/validator";
import { toast } from "sonner";
import { useTranslation } from "@/lib/translations";

const Register = () => {
  const navigate = useNavigate();
  const [cowTag, setCowTag] = useState("");
  const [nosePrintImages, setNosePrintImages] = useState<{[key: string]: File}>({});
  const [facialImage, setFacialImage] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    owner_full_name: '',
    owner_email: '',
    owner_phone: '',
    owner_address: '',
    owner_national_id: '',
    breed: '',
    color: '',
    age: '',
  });
  const [existingOwners, setExistingOwners] = useState<any[]>([]);
  const [phoneSearching, setPhoneSearching] = useState(false);
  const [loadingOwners, setLoadingOwners] = useState(true);
  const [loading, setLoading] = useState(false);
  const [validationStep, setValidationStep] = useState<string>('');
  const { t } = useTranslation();

  useEffect(() => {
    fetchTagInfo();
    fetchExistingOwners();
  }, []);

  const fetchTagInfo = async () => {
    try {
      const data = await cattleAPI.getTagInfo();
      setCowTag(data.next_tag || 'TW-2025-XXX-0001');
    } catch (error) {
      console.error('Failed to fetch tag info:', error);
    }
  };

  const fetchExistingOwners = async () => {
    try {
      setLoadingOwners(true);
      const data = await ownersAPI.getAll();
      console.log('Fetched owners data:', data);
      
      // Handle different possible response formats
      let owners = [];
      if (data.owners) {
        owners = data.owners;
      } else if (Array.isArray(data)) {
        owners = data;
      } else if (data.data) {
        owners = data.data;
      }
      
      console.log('Processed owners:', owners);
      setExistingOwners(owners);
      
      if (owners.length === 0) {
        console.log('No owners found in database');
      }
    } catch (error: any) {
      console.error('Failed to fetch owners:', error);
      if (error.message?.includes('Invalid authentication')) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to load existing owners');
      }
    } finally {
      setLoadingOwners(false);
    }
  };

  const handlePhoneLookup = async (phone: string) => {
    if (phone.length < 8) return; // Wait for reasonable phone length
    
    setPhoneSearching(true);
    const matchingOwner = existingOwners.find(owner => 
      owner.owner_phone === phone || owner.phone === phone
    );
    
    if (matchingOwner) {
      setFormData(prev => ({
        ...prev,
        owner_full_name: matchingOwner.owner_full_name || matchingOwner.full_name || '',
        owner_email: matchingOwner.owner_email || matchingOwner.email || '',
        owner_address: matchingOwner.owner_address || matchingOwner.address || '',
        owner_national_id: matchingOwner.owner_national_id || matchingOwner.national_id || '',
      }));
      toast.success(`✅ Owner found: ${matchingOwner.owner_full_name || matchingOwner.full_name}`);
    }
    setPhoneSearching(false);
  };

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Resize to max 800x800 for faster processing
        const maxSize = 800;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          const compressedFile = new File([blob!], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        }, 'image/jpeg', 0.8);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const validateCowImage = async (file: File): Promise<boolean> => {
    // Basic validation - check file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload only image files');
      return false;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size must be less than 5MB');
      return false;
    }
    
    return true;
  };

  const validateCowNosePrint = async (file: File): Promise<boolean> => {
    try {
      const result = await validatorAPI.validateCowImage(file);
      
      if (!result.is_cow_nose) {
        toast.error('This is not a real cow nose print. Please use a real cow nose print image.');
        return false;
      }
      
      if (result.confidence < 0.7) {
        toast.error(`Image quality is too low (${Math.round(result.confidence * 100)}% confidence). Please capture a clearer cow nose print.`);
        return false;
      }
      
      return true;
    } catch (error: any) {
      console.error('Validator API error:', error);
      if (error.message.includes('Failed to fetch')) {
        toast.error('Validator service is temporarily unavailable. Please try again later.');
      } else {
        toast.error('Failed to validate image. Please try again.');
      }
      return false;
    }
  };

  const handleImageCapture = async (angle: string, file: File) => {
    const isBasicValid = await validateCowImage(file);
    if (isBasicValid) {
      setNosePrintImages(prev => ({ ...prev, [angle]: file }));
    }
  };

  const removeNosePrintImage = (angle: string) => {
    setNosePrintImages(prev => {
      const newImages = { ...prev };
      delete newImages[angle];
      return newImages;
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-lookup when phone number is entered
    if (field === 'owner_phone' && value.length >= 8) {
      handlePhoneLookup(value);
    }
  };

  const clearOwnerForm = () => {
    setFormData(prev => ({
      ...prev,
      owner_full_name: '',
      owner_email: '',
      owner_phone: '',
      owner_address: '',
      owner_national_id: '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const imageCount = Object.keys(nosePrintImages).length;
    if (imageCount < 3) {
      toast.error(`Please capture exactly 3 nose print images. ${imageCount}/3 completed.`);
      return;
    }

    if (!facialImage) {
      toast.error('Please capture 1 facial image.');
      return;
    }

    if (!formData.owner_full_name || !formData.breed || !formData.color || !formData.age) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    
    try {
      let nosePrintFiles = Object.values(nosePrintImages);
      
      // Step 1: Validate cow nose prints
      setValidationStep('Validating cow nose prints...');
      
      // Validate all nose print images in parallel for speed
      const validationPromises = nosePrintFiles.map(async (file, i) => {
        try {
          const result = await validatorAPI.validateCowImage(file);
          console.log(`Validation result ${i+1}:`, result);
          
          if (!result.is_cow_nose) {
            throw new Error(`Image ${i+1}: This is NOT a cow nose print (${Math.round(result.confidence * 100)}% confidence). Please use REAL cow nose print images.`);
          }
          
          if (result.confidence < 0.8) {
            throw new Error(`Image ${i+1}: Quality TOO LOW (${Math.round(result.confidence * 100)}% confidence). Please capture CLEARER cow nose prints.`);
          }
          
          return true;
        } catch (error) {
          throw error;
        }
      });
      
      try {
        await Promise.all(validationPromises);
      } catch (error: any) {
        setValidationStep('');
        toast.error(`🚫 ${error.message}`, {
          duration: 8000,
          style: {
            background: '#dc2626',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold'
          }
        });
        setLoading(false);
        return;
      }
      
      // Step 2: Validation passed
      setValidationStep('This is a nose print of a cow ✓');
      toast.success('✅ ALL NOSE PRINTS VALIDATED SUCCESSFULLY! These are REAL cow nose prints.', {
        duration: 2000,
        style: {
          background: '#16a34a',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold'
        }
      });
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Step 3: Compress images and register cow
      setValidationStep('Registering cow in siamese...');
      
      // Compress images for faster upload
      console.log('🗜 Compressing images for faster upload...');
      const compressedNoseFiles = await Promise.all(
        nosePrintFiles.map(file => compressImage(file))
      );
      const compressedFacialImage = await compressImage(facialImage);
      
      const registrationData = {
        ...formData,
        age: parseInt(formData.age),
      };
      
      const result = await cattleAPI.register(registrationData, compressedNoseFiles, compressedFacialImage);
      
      setValidationStep('');
      
      // Check if registration was successful
      if (result.success === false) {
        // Handle duplicate cow registration
        toast.error(`🚫 COW ALREADY REGISTERED! Tag: ${result.existing_cow_tag}. Please register a new cow.`, {
          duration: 8000,
          style: {
            background: '#dc2626',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold'
          }
        });
        setLoading(false);
        return;
      } else if (result.cow_tag) {
        // Successful registration
        toast.success(`🎉 CATTLE REGISTERED SUCCESSFULLY! Tag: ${result.cow_tag}`, {
          duration: 6000,
          style: {
            background: '#059669',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold'
          }
        });
      } else {
        // Other errors
        toast.error('❌ REGISTRATION FAILED: Invalid response from server', {
          duration: 8000,
          style: {
            background: '#dc2626',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold'
          }
        });
        setLoading(false);
        return;
      }
      
      // Redirect to registered cows page after successful registration
      setTimeout(() => {
        navigate('/registered-cows');
      }, 2000);
      
    } catch (error: any) {
      setValidationStep('');
      console.log('Registration error:', error);
      
      // Show the detailed error message from backend
      toast.error(error.message || 'Failed to register cattle', {
        duration: 8000,
        style: {
          background: '#dc2626',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Validation Step Message - Center Screen */}
      {validationStep && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
            {!validationStep.includes('✓') && (
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
            )}
            {validationStep.includes('✓') && (
              <div className="text-green-500 text-6xl mb-6">✓</div>
            )}
            <h3 className="text-xl font-bold text-gray-800 mb-2">{validationStep}</h3>
            <p className="text-gray-600 text-sm">
              {validationStep.includes('Validating') && 'Please wait while we verify the nose prints...'}
              {validationStep.includes('nose print of a cow') && 'Validation successful! Proceeding to registration...'}
              {validationStep.includes('Registering') && 'Saving cattle data to the system...'}
            </p>
          </div>
        </div>
      )}
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('registerNewCattle')}</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          {t('registerNewCattle')}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Owner Information */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>{t('ownerInformation')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Owner Selection Options */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-3">Quick Owner Selection</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Select disabled={loadingOwners} onValueChange={(value) => {
                    if (value === 'new') {
                      clearOwnerForm();
                      return;
                    }
                    
                    const owner = existingOwners.find(o => 
                      (o.id && o.id.toString() === value) || 
                      (o.owner_id && o.owner_id.toString() === value)
                    );
                    
                    if (owner) {
                      console.log('Selected owner:', owner);
                      setFormData(prev => ({
                        ...prev,
                        owner_full_name: owner.owner_full_name || owner.full_name || owner.name || '',
                        owner_email: owner.owner_email || owner.email || '',
                        owner_phone: owner.owner_phone || owner.phone || '',
                        owner_address: owner.owner_address || owner.address || '',
                        owner_national_id: owner.owner_national_id || owner.national_id || '',
                      }));
                      toast.success(`✅ Selected: ${owner.owner_full_name || owner.full_name || owner.name}`);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        loadingOwners ? "Loading owners..." : 
                        existingOwners.length === 0 ? "No owners found" :
                        "Select existing owner"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">
                        ➕ Enter New Owner
                      </SelectItem>
                      {!loadingOwners && existingOwners.length > 0 && (
                        <>
                          <SelectItem value="" disabled>
                            ─── Existing Owners ───
                          </SelectItem>
                          {existingOwners.map((owner, index) => {
                            const ownerId = owner.id || owner.owner_id || index;
                            const ownerName = owner.owner_full_name || owner.full_name || owner.name || 'Unknown';
                            const ownerPhone = owner.owner_phone || owner.phone || 'No phone';
                            
                            return (
                              <SelectItem key={ownerId} value={ownerId.toString()}>
                                {ownerName} - {ownerPhone}
                              </SelectItem>
                            );
                          })}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={clearOwnerForm}>
                    Clear & Enter New Owner
                  </Button>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  💡 {loadingOwners ? 'Loading owners...' : 
                    existingOwners.length === 0 ? 'No existing owners found. Enter details manually.' :
                    `Found ${existingOwners.length} existing owners. Select one or enter phone number below to auto-fill details`}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ownerPhone">{t('phone')} *</Label>
                <div className="relative">
                  <Input 
                    id="ownerPhone" 
                    type="tel" 
                    placeholder="Enter phone to auto-fill owner details" 
                    value={formData.owner_phone}
                    onChange={(e) => handleInputChange('owner_phone', e.target.value)}
                    required 
                  />
                  {phoneSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ownerName">{t('fullName')} *</Label>
                <Input 
                  id="ownerName" 
                  placeholder={t('fullName')} 
                  value={formData.owner_full_name}
                  onChange={(e) => handleInputChange('owner_full_name', e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder={t('email')} 
                  value={formData.owner_email}
                  onChange={(e) => handleInputChange('owner_email', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{t('address')} *</Label>
                <Input 
                  id="address" 
                  placeholder={t('address')} 
                  value={formData.owner_address}
                  onChange={(e) => handleInputChange('owner_address', e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationalId">{t('nationalId')} *</Label>
                <Input 
                  id="nationalId" 
                  placeholder={t('nationalId')} 
                  value={formData.owner_national_id}
                  onChange={(e) => handleInputChange('owner_national_id', e.target.value)}
                  required 
                />
              </div>
            </CardContent>
          </Card>

          {/* Cattle Information */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>{t('cattleDetails')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="breed">{t('breed')} *</Label>
                <Select value={formData.breed} onValueChange={(value) => handleInputChange('breed', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('breed')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nilotic">Nilotic</SelectItem>
                    <SelectItem value="Mongalla">Mongalla</SelectItem>
                    <SelectItem value="Ankole-Watusi">Ankole-Watusi</SelectItem>
                    <SelectItem value="Nuer">Nuer</SelectItem>
                    <SelectItem value="Dinka">Dinka</SelectItem>
                    <SelectItem value="Abigar">Abigar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">{t('color')} *</Label>
                <Input 
                  id="color" 
                  placeholder={t('color')} 
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">{t('age')} *</Label>
                <Input 
                  id="age" 
                  type="number" 
                  min="0" 
                  placeholder="3" 
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Generated Cow Tag</Label>
                <div className="rounded-md border border-primary bg-primary-lighter px-4 py-3">
                  <p className="font-mono text-lg font-semibold text-primary">{cowTag}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Nose Print Upload */}
        <Card className="shadow-card mt-6">
          <CardHeader>
            <CardTitle>{t('nosePrintImages')}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload exactly 3 clear images of the cow's nose print from different angles
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
              {["Nose Print 1", "Nose Print 2", "Nose Print 3"].map((label, index) => (
                <ImageCapture
                  key={label}
                  label={label}
                  onImageCapture={(file) => handleImageCapture(`nose_${index + 1}`, file)}
                />
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  * Capture exactly 3 nose print images from different angles
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-primary">
                    {Object.keys(nosePrintImages).length}/3 nose images captured
                  </p>

                </div>
              </div>
              <p className="text-xs text-amber-600">
                ⚠️ Images will be validated when you click Register
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Facial Image Upload */}
        <Card className="shadow-card mt-6">
          <CardHeader>
            <CardTitle>Cow Facial Image</CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload 1 clear facial image of the cow for verification
            </p>
          </CardHeader>
          <CardContent>
            <div className="max-w-xs">
              <ImageCapture
                label="Facial Image"
                onImageCapture={async (file) => {
                  const isValid = await validateCowImage(file);
                  if (isValid) {
                    setFacialImage(file);
                  }
                }}
              />
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-xs text-muted-foreground">
                * Ensure the image clearly shows the cow's face
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-primary">
                  {facialImage ? '1/1 facial image captured' : '0/1 facial image captured'}
                </p>

              </div>
              <p className="text-xs text-muted-foreground">
                * This image is for physical verification purposes
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
          <Button type="submit" size="lg" className="flex-1 sm:flex-none" disabled={loading}>
            {loading ? t('processing') : t('registerNewCattle')}
          </Button>
          <Button type="button" variant="secondary" size="lg" className="flex-1 sm:flex-none" disabled={loading}>
            {t('save')}
          </Button>
          <Button type="button" variant="outline" size="lg" className="flex-1 sm:flex-none" disabled={loading}>
            {t('cancel')}
          </Button>
        </div>

        {/* Loading Modal */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold mb-2">Processing Registration</h3>
                <p className="text-muted-foreground text-sm">Please wait while we validate and register the cattle...</p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default Register;
