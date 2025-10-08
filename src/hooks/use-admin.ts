
"use client";

import { useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useUser } from '@/firebase';

export function useAdmin() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const adminDocRef = useMemo(() => {
    if (!user) return null;
    return doc(firestore, `roles_admin/${user.uid}`);
  }, [user, firestore]);

  const { data: adminDoc, isLoading: isAdminLoading } = useDoc(adminDocRef);

  const isAdmin = !!adminDoc;
  const isLoading = isUserLoading || isAdminLoading;

  return { user, isAdmin, isLoading };
}
