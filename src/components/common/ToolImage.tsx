import React, { useState } from 'react';

interface ToolImageProps {
  imageUrl?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ToolImage: React.FC<ToolImageProps> = ({ 
  imageUrl, 
  name, 
  size = 'md',
  className = '' 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl'
  };

  const sizeClass = sizeClasses[size];

  // Log للتشخيص (معطل للإنتاج)
  // useEffect(() => {
  //   if (imageUrl) {
  //     console.log(`🖼️ Tool: ${name}, Image URL: ${imageUrl}`);
  //   } else {
  //     console.log(`⚠️ Tool: ${name}, No image URL provided`);
  //   }
  // }, [imageUrl, name]);

  // إذا لم يكن هناك URL أو حدث خطأ في التحميل
  if (!imageUrl || imageError) {
    return (
      <div 
        className={`${sizeClass} rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md ${className}`}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={`${sizeClass} relative ${className}`}>
      {/* Skeleton loader */}
      {!imageLoaded && (
        <div className={`${sizeClass} rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse absolute inset-0`} />
      )}
      
      {/* الصورة الفعلية */}
      <img 
        src={imageUrl}
        alt={name}
        loading="lazy"
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          console.warn(`Failed to load image for ${name}: ${imageUrl}`);
          setImageError(true);
        }}
        className={`${sizeClass} rounded-xl object-cover shadow-md transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};

export default ToolImage;
