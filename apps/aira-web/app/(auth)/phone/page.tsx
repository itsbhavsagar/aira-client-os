// 'use client';

// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { motion } from 'framer-motion';
// import { LogOut } from 'lucide-react';
// import { AuthLayout } from '@/components/layout';
// import { PhoneInput, AssistantAvatar } from '@/components/auth';
// import { Button } from '@/components/ui/button';
// import { useUpdateUser, useAuthActions, queryClient } from '@repo/core';
// import { webTokenStorage } from '@/lib/api';
// import { ROUTES } from '@/lib/constants';

// export default function PhonePage() {
//   const router = useRouter();
//   const [phone, setPhone] = useState('');
//   const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
//   const { logout } = useAuthActions();

//   const cleanedPhone = phone.replace(/\D/g, '');
//   const isValidPhone = cleanedPhone.length >= 8 && cleanedPhone.length <= 15;

//   const formatPhoneNumber = (input: string): string => {
//     const cleaned = input.replace(/\D/g, '');
//     if (!cleaned) return '';
//     if (cleaned.length <= 3) return `${cleaned}`;
//     const formatted = cleaned.replace(/(\d{3})(?=\d)/g, '$1 ');
//     return `${formatted}`;
//   };

//   const handleContinue = async () => {
//     if (!isValidPhone || isUpdating) return;

//     const formattedPhone = formatPhoneNumber(phone);

//     updateUser(
//       { p_n: formattedPhone.replace(/\s+/g, '') },
//       {
//         onSuccess: () => {
//           // User is now active, redirect to hub
//           router.replace(ROUTES.HUB);
//         },
//         onError: error => {
//           console.error('Failed to update phone number:', error);
//         },
//       },
//     );
//   };

//   const handleLogout = async () => {
//     await logout(webTokenStorage);
//     queryClient.clear();
//     router.push(ROUTES.SIGNIN);
//   };

//   return (
//     <AuthLayout showBrand={false}>
//       <div className="relative">
//         {/* Logout button */}
//         <button
//           onClick={handleLogout}
//           className="absolute -top-16 right-0 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
//         >
//           <LogOut className="h-4 w-4" />
//           <span>Logout</span>
//         </button>

//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="space-y-8"
//         >
//           {/* Header */}
//           <div className="flex items-start justify-between">
//             <div>
//               <h1 className="text-2xl font-bold text-foreground">
//                 You&apos;re in!
//               </h1>
//               <p className="mt-2 text-muted-foreground">
//                 AiRA needs your phone number to get started
//               </p>
//               <p className="mt-1 text-sm text-muted-foreground">
//                 Start with your country code (e.g., +1, +91)
//               </p>
//             </div>

//             {/* Assistant Avatar - visible on larger screens */}
//             <div className="hidden md:block">
//               <AssistantAvatar size="md" />
//             </div>

            
//           </div>

//           {/* Phone Input */}
//           <PhoneInput value={phone} onChange={setPhone} />

//           {/* Mobile Avatar */}
//           <div className="flex justify-center md:hidden">
//             <AssistantAvatar size="lg" />
//           </div>

//           {/* Continue Button */}
//           <Button
//             onClick={handleContinue}
//             disabled={!isValidPhone || isUpdating}
//             size="default"
//             className="w-full"
//           >
//             {isUpdating ? 'Verifying...' : 'Continue'}
//           </Button>

//           {/* Info text */}
//           <p className="text-center text-xs text-muted-foreground">
//             Your phone number will be used for account verification
//           </p>
//         </motion.div>
//       </div>
//     </AuthLayout>
//   );
// }


'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { AuthLayout } from '@/components/layout';
import { PhoneInput, AssistantAvatar } from '@/components/auth';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUpdateUser, useAuthActions, queryClient } from '@repo/core';
import { webTokenStorage } from '@/lib/api';
import { ROUTES } from '@/lib/constants';

export default function PhonePage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
  const { logout } = useAuthActions();

  const cleanedPhone = phone.replace(/\D/g, '');
  const isValidPhone = cleanedPhone.length >= 8 && cleanedPhone.length <= 15;

  // Live validation
  React.useEffect(() => {
    if (!cleanedPhone) {
      setError('');
    } else if (!isValidPhone) {
      setError('Please enter a valid phone number');
    } else {
      setError('');
    }
  }, [cleanedPhone, isValidPhone]);

  const formatPhoneNumber = (input: string): string => {
    const cleaned = input.replace(/\D/g, '');
    if (!cleaned) return '';
    if (cleaned.length <= 3) return cleaned;
    return cleaned.replace(/(\d{3})(?=\d)/g, '$1 ');
  };

  const handleContinue = async () => {
    if (!isValidPhone || isUpdating) return;

    const formattedPhone = cleanedPhone; // no spaces

    updateUser(
      { p_n: formattedPhone },
      {
        onSuccess: () => {
          router.replace(ROUTES.HUB);
        },
        onError: (err) => {
          console.error('Failed to update phone:', err);
          setError('Something went wrong. Try again.');
        },
      },
    );
  };

  const handleSkip = () => {
    router.replace(ROUTES.HUB); 
  };

  const handleLogout = async () => {
    await logout(webTokenStorage);
    queryClient.clear();
    router.push(ROUTES.SIGNIN);
  };

  return (
    <AuthLayout showBrand={false}>
      <div className="relative max-w-md mx-auto py-10 px-6">
        {/* Logout */}
        <button
          onClick={handleLogout}
          className="absolute -top-10 right-0 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-10"
        >
        

          {/* Header */}
          <div className="text-center space-y-4">
       
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              You're in!
            </h1>
            <p className="text-lg text-muted-foreground">
              Add your phone number to unlock full features and let AiRA help you manage your messaging.
            </p>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                    <Info className="h-4 w-4" />
                    Why do we need your phone?
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs text-sm">
                  Your phone is used to securely link your messaging accounts so AiRA can help you in conversations, send reminders, and assist you. We never share it.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Phone Input */}
          <div className="space-y-4">
            <label htmlFor="phone" className="block text-sm font-medium text-foreground">
              Phone number
            </label>
            <PhoneInput value={phone} onChange={setPhone} placeholder="+91 99999 99999" />

            <AnimatePresence mode="wait">
              {error && (
                <motion.p
                  key="error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm text-destructive flex items-center gap-1.5"
                >
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </motion.p>
              )}
              {isValidPhone && phone && (
                <motion.p
                  key="valid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-green-600 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Looks good!
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-4">
            <Button
              onClick={handleContinue}
              disabled={!isValidPhone || isUpdating}
              size="lg"
              className="w-full"
            >
              {isUpdating ? 'Verifying...' : 'Continue'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Skip for now (you can add in settings later)
            </Button>
          </div>

          {/* Privacy note */}
          <p className="text-center text-xs text-muted-foreground pt-4">
            Your phone is used only for secure account linking and verification — we never share it.
          </p>
        </motion.div>
      </div>
    </AuthLayout>
  );
}