'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { servicesService } from "@/lib/firebase/firestore"
import { useAuth } from "@/lib/hooks/useAuth"

export default function ServicesPage() {

  const { companyId } = useAuth()

  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [name,setName] = useState("")
  const [price,setPrice] = useState("")

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

  async function createService(){

    if(!name || !price) return

    try{

      await servicesService.create({
        companyId,
        name,
        price:Number(price)
      })

      setName("")
      setPrice("")

      loadServices()

    }catch(e){

      console.error(e)

    }

  }

  useEffect(()=>{

    if(companyId){
      loadServices()
    }

  },[companyId])

  return (

    <div>

      <h1 style={{fontSize:24,fontWeight:"bold"}}>
        Serviços
      </h1>

      <div style={{marginTop:20,marginBottom:30}}>

        <input
        placeholder="Nome do serviço"
        value={name}
        onChange={(e)=>setName(e.target.value)}
        style={{padding:8,marginRight:10,border:"1px solid #ccc"}}
        />

        <input
        placeholder="Preço"
        value={price}
        onChange={(e)=>setPrice(e.target.value)}
        style={{padding:8,marginRight:10,border:"1px solid #ccc"}}
        />

        <button
        onClick={createService}
        style={{
          padding:"8px 14px",
          background:"#2563eb",
          color:"#fff",
          borderRadius:4
        }}
        >
        Adicionar
        </button>

      </div>

      {loading ? (

        <p>Carregando...</p>

      ) : (

        <div>

          {services.map((service:any)=>(
            
            <div
            key={service.id}
            style={{
              border:"1px solid #e5e7eb",
              padding:12,
              marginBottom:10,
              borderRadius:6
            }}
            >

            <strong>{service.name}</strong>

            <div>R$ {service.price}</div>

            </div>

          ))}

        </div>

      )}

    </div>

  )

}