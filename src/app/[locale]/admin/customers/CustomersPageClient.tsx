'use client'

import { useState } from 'react'
import CustomerFilters from './CustomerFilters'
import CustomersTable from '@/components/admin/CustomersTable'

interface CustomersPageClientProps {
    initialCustomers: any[]
}

export default function CustomersPageClient({ initialCustomers }: CustomersPageClientProps) {
    const [search, setSearch] = useState('')
    const [isCreatingInTable, setIsCreatingInTable] = useState(false)

    return (
        <div className="flex flex-col gap-8">
            <CustomerFilters 
                search={search}
                setSearch={setSearch}
                totalCount={initialCustomers.length}
                onAddCustomer={() => {
                    const event = new CustomEvent('open-customer-modal')
                    window.dispatchEvent(event)
                }}
            />
            <div className="w-full">
                <CustomersTable 
                    initialCustomers={initialCustomers} 
                    externalSearch={search}
                />
            </div>
        </div>
    )
}
