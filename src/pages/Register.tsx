import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageCapture } from "@/components/ui/image-capture";
import { cattleAPI } from "@/services/api";
import { toast } from "sonner";
import { useTranslation } from "@/lib/translations";

const Register = () => {
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

  const handleImageCapture = (angle: string, file: File) => {
    setNosePrintImages(prev => ({ ...prev, [angle]: file }));
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
      const nosePrintFiles = Object.values(nosePrintImages);
      const registrationData = {
        ...formData,
        age: parseInt(formData.age),
      };
      
      // Create FormData manually to match backend requirements
      const formDataToSend = new FormData();
      Object.keys(registrationData).forEach(key => {
        if (registrationData[key] !== null && registrationData[key] !== undefined && registrationData[key] !== '') {
          formDataToSend.append(key, registrationData[key]);
        }
      });
      
      // Add nose print files (exactly 3)
      nosePrintFiles.forEach(file => formDataToSend.append('nose_print_files', file));
      
      // Add facial image file (exactly 1)
      formDataToSend.append('facial_image_file', facialImage);
      
      const result = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/register-cow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: formDataToSend,
      }).then(res => res.json());
      toast.success(`Cattle registered successfully! Tag: ${result.cow_tag}`);
      
      // Reset form
      setFormData({
        owner_full_name: '',
        owner_email: '',
        owner_phone: '',
        owner_address: '',
        owner_national_id: '',
        breed: '',
        color: '',
        age: '',
      });
      setNosePrintImages({});
      setFacialImage(null);
      fetchTagInfo(); // Get new tag
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
                    <SelectItem value="Friesian">Friesian</SelectItem>
                    <SelectItem value="Jersey">Jersey</SelectItem>
                    <SelectItem value="Holstein">Holstein</SelectItem>
                    <SelectItem value="Angus">Angus</SelectItem>
                    <SelectItem value="Sahiwal">Sahiwal</SelectItem>
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
              Upload 5 clear images of the cow's nose print from different angles
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
              {["Front", "Left", "Right"].map((angle) => (
                <ImageCapture
                  key={angle}
                  label={`Nose ${angle}`}
                  onImageCapture={(file) => handleImageCapture(angle, file)}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                * Capture exactly 3 nose print images from different angles
              </p>
              <p className="text-xs font-medium text-primary">
                {Object.keys(nosePrintImages).length}/3 nose images captured
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
                onImageCapture={(file) => setFacialImage(file)}
              />
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">
                * Ensure the image clearly shows the cow's face
              </p>
              <p className="text-xs font-medium text-primary">
                {facialImage ? '1/1 facial image captured' : '0/1 facial image captured'}
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
                <h3 className="text-lg font-semibold mb-2">Registering Cattle</h3>
                <p className="text-muted-foreground text-sm">Processing nose prints and saving to database...</p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default Register;
