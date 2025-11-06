import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageCapture } from "@/components/ui/image-capture";
import { cattleAPI } from "@/services/api";
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
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetchTagInfo();
  }, []);

  const fetchTagInfo = async () => {
    try {
      const data = await cattleAPI.getTagInfo();
      setCowTag(data.next_tag || 'TW-2025-XXX-0001');
    } catch (error) {
      console.error('Failed to fetch tag info:', error);
    }
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
      // Step 1: Validate cow nose prints
      const loadingToast = toast.loading('Validating cow nose prints...');
      
      const nosePrintFiles = Object.values(nosePrintImages);
      
      // Validate all nose print images
      for (let i = 0; i < nosePrintFiles.length; i++) {
        const result = await validatorAPI.validateCowImage(nosePrintFiles[i]);
        
        if (!result.is_cow_nose) {
          toast.dismiss(loadingToast);
          toast.error('This is not a cow nose print. Please use real cow nose print images.');
          setLoading(false);
          return;
        }
        
        if (result.confidence < 0.7) {
          toast.dismiss(loadingToast);
          toast.error(`Image quality is too low (${Math.round(result.confidence * 100)}% confidence). Please capture clearer cow nose prints.`);
          setLoading(false);
          return;
        }
      }
      
      // Step 2: All validations passed
      toast.dismiss(loadingToast);
      toast.success('Cow nose prints validated successfully!');
      
      // Step 3: Register cow
      const registerToast = toast.loading('Registering cow...');
      
      const registrationData = {
        ...formData,
        age: parseInt(formData.age),
      };
      
      const result = await cattleAPI.register(registrationData, nosePrintFiles, facialImage);
      
      toast.dismiss(registerToast);
      toast.success(`Cattle registered successfully! Tag: ${result.cow_tag}`);
      
      // Redirect to registered cows page after successful registration
      setTimeout(() => {
        navigate('/registered-cows');
      }, 2000);
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to register cattle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
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
                <Label htmlFor="phone">{t('phone')} *</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder={t('phone')} 
                  value={formData.owner_phone}
                  onChange={(e) => handleInputChange('owner_phone', e.target.value)}
                  required 
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
