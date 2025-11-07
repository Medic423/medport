import React from 'react';
import { Unit, UNIT_CAPABILITY_LABELS, UNIT_STATUS_COLORS, UNIT_TYPE_LABELS } from '../types/units';

interface UnitCardProps {
  unit: Unit;
  selected?: boolean;
  onSelect?: (unitId: string) => void;
}

const UnitCard: React.FC<UnitCardProps> = ({ unit, selected, onSelect }) => {
  return (
    <div
      className={`p-3 border rounded ${selected ? 'ring-2 ring-green-500' : ''} hover:bg-gray-50 cursor-pointer`}
      onClick={() => onSelect && onSelect(unit.id)}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium">Unit {unit.unitNumber}</span>
        <span className={`inline-flex px-2 py-0.5 text-xs rounded ${UNIT_STATUS_COLORS[unit.currentStatus]}`}>{unit.currentStatus}</span>
        <span className="text-xs text-gray-500">{UNIT_TYPE_LABELS[unit.type]}</span>
      </div>
      <div className="mt-1 text-xs text-gray-600">
        Capabilities: {unit.capabilities.map((c) => UNIT_CAPABILITY_LABELS[c] || c).join(', ')}
      </div>
    </div>
  );
};

export default UnitCard;


