'use client'

import { useEffect, useState } from "react"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "../../lib/firebase/firestore"
import { useAuth } from "@/hooks/useAuth"

export default function SettingsPage() {

  const { user } = useAuth()
  const [company, setCompany] = useState(null)

  useEffect(() => {

    async function loadCompany() {

      if (!user) return

      const ref = doc(db, "companies", user.companyId)
      const snap = await getDoc(ref)

      if (snap.exists()) {
        setCompany(snap.data())
      }

    }

    loadCompany()

  }, [user])

  async function save() {

    const ref = doc(db, "companies", user.companyId)

    await updateDoc(ref, company)

    alert("Configurações atualizadas")

  }

  if (!company) return <div>Carregando...</div>

  return (

    <div style={{padding:20}}>

      <h1>Configurações da Empresa</h1>

      <input
        value={company.name || ""}
        placeholder="Nome da empresa"
        onChange={(e)=>
          setCompany({...company, name:e.target.value})
        }
      />

      <br/><br/>

      <input
        value={company.phone || ""}
        placeholder="Telefone"
        onChange={(e)=>
          setCompany({...company, phone:e.target.value})
        }
      />

      <br/><br/>

      <button onClick={save}>
        Salvar
      </button>

    </div>
  )
}