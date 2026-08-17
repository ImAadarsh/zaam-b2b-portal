'use client';

import React from 'react';
import { Truck } from 'lucide-react';

export interface DeliveryOption {
  id: string;
  code?: string;
  name: string;
  description?: string;
  price: number;
  estimatedDate?: string;
  icon?: string;
}

interface DeliverySelectorProps {
  options: DeliveryOption[];
  selectedOption: string;
  onSelect: (id: string) => void;
}

export const DeliverySelector: React.FC<DeliverySelectorProps> = ({ options, selectedOption, onSelect }) => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-neutral-100 rounded-lg text-neutral-700">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Delivery & Fulfillment Method</h3>
            <p className="text-[11px] text-neutral-500">Options from ERP B2B shipping methods</p>
          </div>
        </div>
      </div>

      {options.length === 0 ? (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
          No shipping options returned from the API. Ask staff to configure B2B shipping methods in the panel.
        </p>
      ) : (
        <div className="space-y-2.5">
          {options.map((opt) => {
            const id = opt.id || opt.code || '';
            const isSelected = selectedOption === id;
            return (
              <div
                key={id}
                onClick={() => onSelect(id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3.5 ${
                  isSelected
                    ? 'border-zaam-green-600 bg-zaam-green-50/40 ring-2 ring-zaam-green-600/15'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="mt-0.5">
                  <input
                    type="radio"
                    name="delivery"
                    checked={isSelected}
                    onChange={() => onSelect(id)}
                    className="w-4 h-4 text-zaam-green-600 accent-zaam-green-600 cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-neutral-900">{opt.name}</h4>
                    <span className="text-xs font-extrabold text-zaam-green-700">
                      {Number(opt.price) === 0 ? 'FREE' : `£${Number(opt.price).toFixed(2)}`}
                    </span>
                  </div>
                  {opt.description && <p className="text-xs text-neutral-600 mt-0.5">{opt.description}</p>}
                  {opt.estimatedDate && (
                    <p className="text-[11px] text-neutral-400 font-medium mt-1">
                      Est: <strong className="text-neutral-700">{opt.estimatedDate}</strong>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
