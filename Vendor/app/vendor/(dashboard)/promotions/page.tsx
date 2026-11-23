"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Tag, Percent, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

const promotions = [
  {
    id: 1,
    name: "Summer Early Bird",
    code: "SUMMER25",
    discount: "25%",
    type: "Percentage",
    status: "Active",
    validUntil: "2026-08-31",
    usage: 45,
  },
  {
    id: 2,
    name: "Weekend Getaway",
    code: "WKND100",
    discount: "₹100",
    type: "Fixed Amount",
    status: "Active",
    validUntil: "2026-12-31",
    usage: 12,
  },
  {
    id: 3,
    name: "Last Minute Deal",
    code: "LASTMIN50",
    discount: "50%",
    type: "Percentage",
    status: "Expired",
    validUntil: "2026-05-01",
    usage: 89,
  }
];

export default function PromotionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-secondary">Promotions</h2>
          <p className="text-slate-500 mt-1">Manage your discount codes and special offers.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
          <Plus className="w-4 h-4" />
          Create Promotion
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {promotions.map((promo, index) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
            key={promo.id}
          >
            <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-xl bg-white overflow-hidden group hover:shadow-md transition-all">
              <CardContent className="p-0">
                <div className={`h-2 w-full ${promo.status === 'Active' ? 'bg-primary' : 'bg-slate-300'}`}></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                      {promo.type === 'Percentage' ? <Percent className="w-6 h-6" /> : <Tag className="w-6 h-6" />}
                    </div>
                    <Button variant="ghost" size="icon" className="-mr-2 -mt-2 text-slate-400">
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  <h3 className="text-xl font-heading font-bold text-secondary mb-1">{promo.name}</h3>
                  <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-mono text-sm font-semibold mb-6">
                    {promo.code}
                  </div>
                  
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Discount</span>
                      <span className="font-semibold text-secondary">{promo.discount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Status</span>
                      <span className={`font-semibold ${promo.status === 'Active' ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {promo.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Valid Until</span>
                      <span className="font-semibold text-secondary">{promo.validUntil}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Total Usage</span>
                      <span className="font-semibold text-secondary">{promo.usage} times</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
