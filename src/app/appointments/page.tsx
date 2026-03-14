'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { appointmentsService } from "@/lib/firebase/firestore"
import { useAuth } from "@/lib/hooks/useAuth"

export default function AppointmentsPage() {

  const { companyId } = useAuth()

  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function loadAppointments() {

    if (!companyId) return

    setLoading(true)

    try {

      const data = await appointmentsService.getAll(companyId)

      setAppointments(data)

    } catch (error) {

      console.error(error)

    } finally {

      setLoading(false)

    }

  }

  useEffect(() => {
    loadAppointments()
  }, [companyId])

  return (

    <div>

      <h1 style={{fontSize:24,fontWeight:"bold"}}>
        Agendamentos
      </h1>

      {loading ? (
        <p style={{marginTop:20}}>Carregando...</p>
      ) : (

        <div style={{marginTop:20}}>

          {appointments.length === 0 && (
            <p>Nenhum agendamento encontrado</p>
          )}

          {appointments.map((item:any) => (

            <div
              key={item.id}
              style={{
                padding:12,
                border:"1px solid #e5e7eb",
                borderRadius:6,
                marginBottom:10
              }}
            >

              <strong>{item.clientName}</strong>

              <div>{item.serviceName}</div>

            </div>

          ))}

        </div>

      )}

    </div>

  )

}