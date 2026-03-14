'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { servicesService } from "@/lib/firebase/firestore"
import { useAuth } from "@/lib/hooks/useAuth"

export default function ServicesPage() {

  const { companyId } = useAuth()

  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function loadServices() {

    if (!companyId) return

    try {

      setLoading(true)

      const data = await servicesService.getAll(companyId)

      setServices(data)

    } catch (error) {

      console.error(error)

    } finally {

      setLoading(false)

    }

  }

  useEffect(() => {

    if (companyId) {
      loadServices()
    }

  }, [companyId])

  return (

    <div>

      <h1 style={{fontSize:24,fontWeight:"bold"}}>
        Serviços
      </h1>

      {loading ? (

        <p style={{marginTop:20}}>Carregando...</p>

      ) : (

        <div style={{marginTop:20}}>

          {services.length === 0 && (
            <p>Nenhum serviço cadastrado</p>
          )}

          {services.map((service:any) => (

            <div
              key={service.id}
              style={{
                padding:12,
                border:"1px solid #e5e7eb",
                borderRadius:6,
                marginBottom:10
              }}
            >

              <strong>{service.name}</strong>

              <div>Preço: R$ {service.price}</div>

            </div>

          ))}

        </div>

      )}

    </div>

  )

}