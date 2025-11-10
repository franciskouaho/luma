import React from 'react';
import Image from 'next/image';

interface PlatformIconProps {
  platform: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  profileImageUrl?: string;
  username?: string;
}

export function PlatformIcon({ platform, size = 'md', className = '', profileImageUrl, username }: PlatformIconProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-12 h-12',
    lg: 'w-14 h-14'
  };

  // Si className contient une taille spécifique (comme w-1.5 h-1.5), l'utiliser
  const hasCustomSize = className.includes('w-') && className.includes('h-');
  const finalSizeClass = hasCustomSize ? className : sizeClasses[size];
  
  // Extraire les classes de style (ring, border, etc.) de className
  const styleClasses = className.split(' ').filter(cls => 
    cls.includes('ring-') || cls.includes('border-') || cls.includes('shadow-') || 
    cls.includes('scale-') || cls.includes('transition-') || cls.includes('opacity-')
  ).join(' ');



  const getPlatformIcon = () => {
    const getProfileImage = () => {
      if (profileImageUrl) {
        return (
          <Image
            src={profileImageUrl}
            alt={username || 'Profile'}
            fill
            className="rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        );
      }
      return (
        <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center">
          {username ? (
            <span className="text-xs font-semibold text-gray-700">
              {username.charAt(0).toUpperCase()}
            </span>
          ) : (
            <svg className="w-2/3 h-2/3 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          )}
        </div>
      );
    };

    switch (platform.toLowerCase()) {
      case 'tiktok':
        return (
          <div className={`${finalSizeClass} relative aspect-square rounded-full ${styleClasses}`}>
            {/* Avatar avec SEULEMENT la photo */}
            <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden relative bg-gray-200">
              {profileImageUrl && (
                <Image
                  src={profileImageUrl}
                  alt={username || 'Profile'}
                  fill
                  className="rounded-full object-cover"
                />
              )}
            </div>
            {/* Petit badge TikTok dans le coin */}
            <div className={`absolute bottom-0 right-0 ${hasCustomSize ? 'w-4 h-4' : 'w-5 h-5'} bg-black rounded-full flex items-center justify-center border-2 border-white`}>
              <svg className={hasCustomSize ? 'w-2 h-2' : 'w-3 h-3'} viewBox="0 0 24 24" fill="white">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </div>
          </div>
        );
      
      case 'instagram':
        return (
          <div className={`${finalSizeClass} relative aspect-square rounded-full ${styleClasses}`}>
            <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden relative bg-gray-200">
              {profileImageUrl && (
                <Image
                  src={profileImageUrl}
                  alt={username || 'Profile'}
                  fill
                  className="rounded-full object-cover"
                />
              )}
            </div>
            <div className={`absolute bottom-0 right-0 ${hasCustomSize ? 'w-4 h-4' : 'w-5 h-5'} bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full flex items-center justify-center border-2 border-white`}>
              <svg className={hasCustomSize ? 'w-2 h-2' : 'w-3 h-3'} fill="white" viewBox="0 0 24 24">
                <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 0 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
              </svg>
            </div>
          </div>
        );

      case 'facebook':
        return (
          <div className={`${finalSizeClass} relative aspect-square rounded-full ${styleClasses}`}>
            <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden relative bg-gray-200">
              {profileImageUrl && (
                <Image
                  src={profileImageUrl}
                  alt={username || 'Profile'}
                  fill
                  className="rounded-full object-cover"
                />
              )}
            </div>
            <div className={`absolute bottom-0 right-0 ${hasCustomSize ? 'w-4 h-4' : 'w-5 h-5'} bg-blue-600 rounded-full flex items-center justify-center border-2 border-white`}>
              <svg className={hasCustomSize ? 'w-2 h-2' : 'w-2.5 h-2.5'} fill="white" viewBox="0 0 24 24">
                <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 3.667h-3.533v7.98H9.101z"/>
              </svg>
            </div>
          </div>
        );

      case 'linkedin':
        return (
          <div className={`${finalSizeClass} relative aspect-square rounded-full ${styleClasses}`}>
            <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden relative bg-gray-200">
              {profileImageUrl && (
                <Image
                  src={profileImageUrl}
                  alt={username || 'Profile'}
                  fill
                  className="rounded-full object-cover"
                />
              )}
            </div>
            <div className={`absolute bottom-0 right-0 ${hasCustomSize ? 'w-4 h-4' : 'w-5 h-5'} bg-blue-700 rounded-full flex items-center justify-center border-2 border-white`}>
              <svg className={hasCustomSize ? 'w-2 h-2' : 'w-2.5 h-2.5'} fill="white" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
            </div>
          </div>
        );

      case 'youtube':
        return (
          <div className={`${finalSizeClass} relative aspect-square rounded-full ${styleClasses}`}>
            <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden relative bg-gray-200">
              {profileImageUrl && (
                <Image
                  src={profileImageUrl}
                  alt={username || 'Profile'}
                  fill
                  className="rounded-full object-cover"
                />
              )}
            </div>
            <div className={`absolute bottom-0 right-0 ${hasCustomSize ? 'w-4 h-4' : 'w-5 h-5'} bg-red-600 rounded-full flex items-center justify-center border-2 border-white`}>
              <svg className={hasCustomSize ? 'w-2 h-2' : 'w-2.5 h-2.5'} fill="white" viewBox="0 0 24 24">
                <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/>
              </svg>
            </div>
          </div>
        );

      case 'twitter':
        return (
          <div className={`${finalSizeClass} relative aspect-square rounded-full ${styleClasses}`}>
            <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden relative bg-gray-200">
              {profileImageUrl && (
                <Image
                  src={profileImageUrl}
                  alt={username || 'Profile'}
                  fill
                  className="rounded-full object-cover"
                />
              )}
            </div>
            <div className={`absolute bottom-0 right-0 ${hasCustomSize ? 'w-4 h-4' : 'w-5 h-5'} bg-black rounded-full flex items-center justify-center border-2 border-white`}>
              <svg className={hasCustomSize ? 'w-2 h-2' : 'w-2.5 h-2.5'} fill="white" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
          </div>
        );

      default:
        return (
          <div className={`${finalSizeClass} relative aspect-square rounded-full ${styleClasses}`}>
            <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden relative bg-gray-200">
              {profileImageUrl && (
                <Image
                  src={profileImageUrl}
                  alt={username || 'Profile'}
                  fill
                  className="rounded-full object-cover"
                />
              )}
            </div>
          </div>
        );
    }
  };

  return getPlatformIcon();
}
