'use client'

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../../lib/firebase/firestore"

export default function Dashboard() {

  const [clients, setClients] = useState(0)
  const [vehicles, setVehicles] = useState(0)
  const [appointments, setAppointments] = useState(0)
  const [financial, setFinancial] = useState(0)

  useEffect(() => {

    async function loadData() {

      const clientsSnap = await getDocs(collection(db, "clients"))
      setClients(clientsSnap.size)

      const vehiclesSnap = await getDocs(collection(db, "vehicles"))
      setVehicles(vehiclesSnap.size)

      const appointmentsSnap = await getDocs(collection(db, "appointments"))
      setAppointments(appointmentsSnap.size)

      const financialSnap = await getDocs(collection(db, "financial"))

      let total = 0
      financialSnap.forEach(doc => {
        const data:any = doc.data()
        total += data.amount || 0
      })

      setFinancial(total)

    }

    loadData()

  }, [])

  return (

    <div style={{padding:20}}>

      <h1>Dashboard DetailPro</h1>

      <div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:20}}>

        <div>
          <h3>Clientes</h3>
          <p>{clients}</p>
        </div>

        <div>
          <h3>Veículos</h3>
          <p>{vehicles}</p>
        </div>

        <div>
          <h3>Agendamentos</h3>
          <p>{appointments}</p>
        </div>

        <div>
          <h3>Faturamento</h3>
          <p>R$ {financial}</p>
        </div>

      </div>

    </div>

  )
}
