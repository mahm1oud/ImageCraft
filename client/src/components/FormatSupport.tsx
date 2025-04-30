import { Card, CardContent } from '@/components/ui/card';

interface FormatProps {
  code: string;
  name: string;
}

const FormatSupport = () => {
  const formats: FormatProps[] = [
    { code: 'JPG', name: 'JPEG/JPG' },
    { code: 'PNG', name: 'PNG' },
    { code: 'WEBP', name: 'WEBP' },
    { code: 'SVG', name: 'SVG' },
    { code: 'GIF', name: 'GIF' },
    { code: 'TIF', name: 'TIFF/TIF' },
    { code: 'PSD', name: 'PSD' },
    { code: 'HEIC', name: 'HEIC/HEIF' },
    { code: 'RAW', name: 'RAW' },
    { code: 'BMP', name: 'BMP' },
  ];

  return (
    <section className="mb-12">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold font-poppins text-textColor mb-6 text-center">
            Support for All Major Image Formats
          </h2>
          
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-6">
            {formats.map((format, index) => (
              <div className="text-center p-2" key={index}>
                <div className="h-20 flex items-center justify-center">
                  <div className="bg-blue-50 text-primary text-xl font-bold rounded-lg p-4 w-16 h-16 flex items-center justify-center">
                    {format.code}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{format.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default FormatSupport;
