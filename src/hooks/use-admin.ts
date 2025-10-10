
"use client";

import { useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useUser } from '@/firebase';

export function useAdmin() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const adminDocRef = useMemo(() => {
    if (!user) return null;
    // This is a protected collection for admin roles.
    // Replace `roles_admin` with your actual collection name if different.
    return doc(firestore, `roles_admin/${user.uid}`);
  }, [user, firestore]);

  const { data: adminDoc, isLoading: isAdminLoading } = useDoc(adminDocRef);

  const isAdmin = !!adminDoc;
  const isLoading = isUserLoading || (user && isAdminLoading);

  return { user, isAdmin, isLoading };
}
