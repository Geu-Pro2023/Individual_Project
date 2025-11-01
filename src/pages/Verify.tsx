import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { ImageCapture } from "@/components/ui/image-capture";
import { VerificationResults } from "@/components/verification/VerificationResults";
import { GPSTracker } from "@/components/ui/gps-tracker";
import { verificationAPI } from "@/services/api";
import { toast } from "sonner";

const Verify = () => {
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [cowTag, setCowTag] = useState("");
  const [nosePrintImage, setNosePrintImage] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleNosePrintVerify = async () => {
    if (!nosePrintImage) {
      toast.error("Please capture or upload a nose print image");
      return;
    }

    setVerifying(true);
    try {
      const location = (document.getElementById('location') as HTMLInputElement)?.value;
      console.log('Sending nose print verification...');
      console.log('Image file:', nosePrintImage);
      console.log('Location:', location);
      
      const result = await verificationAPI.verifyByNose([nosePrintImage], location);
      
      console.log('Raw nose verification result:', result);
      
      console.log('Processing verification result...');
      
      if (result && result.verification_results && Array.isArray(result.verification_results) && result.verification_results.length > 0) {
        const verification = result.verification_results[0];
        console.log('Verification data:', verification);
        
        if (verification && verification.cow_found === true) {
          console.log('Full cow_details:', verification.cow_details);
          console.log('Facial image URL:', verification.cow_details?.facial_image_url);
          
          setVerificationResult({
            found: true,
            similarity: (verification.similarity || 0) * 100,
            cow: {
              cow_tag: verification.cow_details?.cow_tag,
              breed: verification.cow_details?.breed,
              color: verification.cow_details?.color,
              owner_name: verification.cow_details?.owner_name,
              facial_image_url: verification.cow_details?.facial_image_url
            },
            verified: verification.verified,
            method: verification.verification_method
          });
          toast.success("Cow verified successfully!");
        } else {
          setVerificationResult({
            found: false,
            message: "No matching cow found",
          });
          toast.warning("No matching cow found");
        }
      } else {
        console.log('Invalid result format:', result);
        setVerificationResult({
          found: false,
          message: "Invalid response format",
        });
        toast.error("Verification failed - invalid response");
      }
    } catch (error: any) {
      console.error('Full nose print error:', error);
      console.error('Error details:', error.response || error.message);
      if (error.detail === 'Invalid authentication' || result?.detail === 'Invalid authentication') {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('admin_token');
        window.location.href = '/login';
        return;
      }
      toast.error(`Verification failed: ${error.message || 'Unknown error'}`);
    } finally {
      setVerifying(false);
    }
  };

  const handleTagLookup = async () => {
    if (!cowTag.trim()) {
      toast.error("Please enter a cow tag");
      return;
    }

    setVerifying(true);
    try {
      const location = (document.getElementById('tagLocation') as HTMLInputElement)?.value;
      console.log('Sending tag verification...');
      console.log('Cow tag:', cowTag);
      console.log('Location:', location);
      
      const result = await verificationAPI.verifyByTag(cowTag, location);
      
      console.log('Raw tag verification result:', result);
      console.log('Result type:', typeof result);
      console.log('Has verification_results?', !!result?.verification_results);
      console.log('Is array?', Array.isArray(result?.verification_results));
      
      console.log('Processing tag verification result...');
      
      if (result && result.verification_results && Array.isArray(result.verification_results) && result.verification_results.length > 0) {
        const verification = result.verification_results[0];
        console.log('Tag verification data:', verification);
        
        if (verification && verification.cow_found === true) {
          setVerificationResult({
            found: true,
            similarity: 100,
            cow: {
              cow_tag: verification.cow_details?.cow_tag,
              breed: verification.cow_details?.breed,
              color: verification.cow_details?.color,
              owner_name: verification.cow_details?.owner_name,
              facial_image_url: verification.cow_details?.facial_image_url
            },
            verified: verification.verified,
            method: verification.verification_method
          });
          toast.success("Cow found and verified!");
        } else {
          setVerificationResult({
            found: false,
            message: "Cow tag not found",
          });
          toast.warning("Cow tag not found");
        }
      } else {
        console.log('Invalid tag result format:', result);
        console.log('Expected verification_results array, got:', result);
        setVerificationResult({
          found: false,
          message: "Invalid response format",
        });
        toast.error("Tag lookup failed - invalid response");
      }
    } catch (error: any) {
      console.error('Full tag lookup error:', error);
      console.error('Error details:', error.response || error.message);
      if (error.detail === 'Invalid authentication' || result?.detail === 'Invalid authentication') {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('admin_token');
        window.location.href = '/login';
        return;
      }
      toast.error(`Tag lookup failed: ${error.message || 'Unknown error'}`);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Verification Center</h1>
        <p className="text-muted-foreground mt-1">
          Verify cattle using nose print or tag lookup with GPS location tracking
        </p>
      </div>

      <Tabs defaultValue="noseprint" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="noseprint">Nose Print Verification</TabsTrigger>
          <TabsTrigger value="tag">Tag Lookup</TabsTrigger>
        </TabsList>

        <TabsContent value="noseprint" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Upload Nose Print Image</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload a clear image of the cow's nose print for verification
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="max-w-md mx-auto">
                  <ImageCapture
                    label="Nose Print"
                    onImageCapture={(file) => setNosePrintImage(file)}
                  />
                </div>
                <Button size="lg" className="w-full" onClick={handleNosePrintVerify} disabled={verifying}>
                  <Search className="mr-2 h-4 w-4" />
                  {verifying ? 'Verifying...' : 'Verify Nose Print'}
                </Button>
              </CardContent>
            </Card>
            
            <GPSTracker 
              onLocationUpdate={(location) => setCurrentLocation(location)}
              showMap={true}
            />
          </div>
        </TabsContent>

        <TabsContent value="tag" className="mt-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Tag Lookup</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter the cow tag to retrieve information
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cowTag">Cow Tag</Label>
                <Input
                  id="cowTag"
                  placeholder="TW-2025-XXX-XXXX"
                  className="font-mono text-lg"
                  value={cowTag}
                  onChange={(e) => setCowTag(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagLocation" className="text-xs">
                  Location (Optional)
                </Label>
                <Input id="tagLocation" placeholder="GPS coordinates or address" />
              </div>
              <Button size="lg" className="w-full" onClick={handleTagLookup} disabled={verifying}>
                <Search className="mr-2 h-4 w-4" />
                {verifying ? 'Looking up...' : 'Lookup Tag'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {verificationResult && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {verificationResult.found ? '✅ Verification Successful' : '❌ No Match Found'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {verificationResult.found ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Cow Image</h3>

                      <div className="relative w-full h-64 border rounded bg-gray-50 overflow-hidden cursor-pointer" onClick={() => setShowImageModal(true)}>
                        <img 
                          src={`${import.meta.env.VITE_API_BASE_URL}${verificationResult.cow?.facial_image_url}`}
                          alt={`Cow ${verificationResult.cow?.cow_tag}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        onError={(e) => {
                          console.log('Image failed to load - URL returns 404');
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling.style.display = 'flex';
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully!');
                        }}
                        />
                        {/* Verified Watermark */}
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          ✓ VERIFIED
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                          Click to zoom
                        </div>
                      </div>
                      <div className="border rounded h-48 items-center justify-center bg-blue-50 text-center" style={{display: 'none'}}>
                        <div className="p-4">
                          <div className="text-6xl mb-2">🐄</div>
                          <p className="font-semibold text-blue-700">Cow Image Available</p>
                          <p className="text-sm text-blue-600 mt-1">Backend static files need to be deployed</p>
                          <p className="text-xs text-muted-foreground mt-2">Path: {verificationResult.cow?.facial_image_url}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Cow Details</h3>
                      <div className="space-y-2 text-sm">
                        <p><strong>Tag:</strong> {verificationResult.cow?.cow_tag}</p>
                        <p><strong>Breed:</strong> {verificationResult.cow?.breed}</p>
                        <p><strong>Color:</strong> {verificationResult.cow?.color}</p>
                        <p><strong>Owner:</strong> {verificationResult.cow?.owner_name}</p>
                        <p><strong>Similarity:</strong> {verificationResult.similarity}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">{verificationResult.message}</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading Modal */}
      {verifying && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Verifying Cattle</h3>
              <p className="text-muted-foreground text-sm">Processing verification and checking database...</p>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {showImageModal && verificationResult?.cow?.facial_image_url && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowImageModal(false)}>
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={`${import.meta.env.VITE_API_BASE_URL}${verificationResult.cow.facial_image_url}`}
              alt={`Cow ${verificationResult.cow.cow_tag} - Full Size`}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold"
            >
              ×
            </button>
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded">
              <p className="font-semibold">{verificationResult.cow.cow_tag}</p>
              <p className="text-sm">{verificationResult.cow.breed} - {verificationResult.cow.color}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Verify;
