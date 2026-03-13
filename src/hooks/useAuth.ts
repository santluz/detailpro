'use client'

import { useEffect, useState } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"

export function useAuth() {

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const auth = getAuth()

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {

      if (firebaseUser) {
        setUser(firebaseUser)
      } else {
        setUser(null)
      }

      setLoading(false)

    })

    return () => unsubscribe()

  }, [])

  return { user, loading }

}