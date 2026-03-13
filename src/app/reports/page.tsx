'use client'

import { useEffect, useState } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../../lib/firebase/firestore"
import { useAuth } from "@/hooks/useAuth"

export default function ReportsPage() {

  const { user } = useAuth()
  const [total, setTotal] = useState(0)

  useEffect(() => {

    async function loadFinancial() {

      if (!user) return

      const q = query(
        collection(db, "financial"),
        where("companyId", "==", user.companyId)
      )

      const snap = await getDocs(q)

      let sum = 0

      snap.forEach(doc => {
        const data = doc.data()
        sum += data.amount || 0
      })

      setTotal(sum)

    }

    loadFinancial()

  }, [user])

  return (

    <div style={{padding:20}}>

      <h1>Relatórios</h1>

      <h2>Faturamento Total</h2>

      <p style={{fontSize:24}}>
        R$ {total}
      </p>

    </div>
  )
}
