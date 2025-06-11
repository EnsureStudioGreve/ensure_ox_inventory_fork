import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Inventory } from '../../typings';
import WeightBar from '../utils/WeightBar';
import InventorySlot from './InventorySlot';
import { getTotalWeight } from '../../helpers';
import { useAppSelector } from '../../store';
import { useIntersection } from '../../hooks/useIntersection';
import { Weight, BriefcaseBusiness } from 'lucide-react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const PAGE_SIZE = 30;

const InventoryGrid: React.FC<{ inventory: Inventory }> = ({ inventory }) => {

  const [page, setPage] = useState(0);
  const containerRef = useRef(null);
  const { ref, entry } = useIntersection({ threshold: 0.5 });
  const isBusy = useAppSelector((state) => state.inventory.isBusy);

    const weight = useMemo(() => {
    if (inventory.maxWeight === undefined) return 0;
    return Math.floor(getTotalWeight(inventory.items) * 1000) / 1000;
  }, [inventory.items, inventory.maxWeight]);

  useEffect(() => {
    if (entry?.isIntersecting) {
      setPage((prev) => prev + 1);
    }
  }, [entry]);

  return (
    <div className="inventory-grid-wrapper" style={{ pointerEvents: isBusy ? 'none' : 'auto' }}>
      <div className="inventory-grid-header-wrapper">
        {inventory.label && (
          <div className="inventory-box-name">
            <BriefcaseBusiness className='inventory-icon' />
            <p>{inventory.label}</p>
          </div>
        )}

        {inventory.maxWeight && (
          <Tippy content={<span>{weight / 1000}/{inventory.maxWeight / 1000}kg</span>} theme='loop-theme'>
            <div className="inventory-box-weight">
              <Weight className='inventory-icon' />
              <div className="weight-bar-box">
                <WeightBar percent={(weight / inventory.maxWeight) * 100} />
              </div>
              {/* <p>{weight / 1000}/{inventory.maxWeight / 1000}kg</p> */}
            </div>
          </Tippy>
        )}
      </div>

      <div className="inventory-grid-container" ref={containerRef}>
        {inventory.items.slice(0, (page + 1) * PAGE_SIZE).map((item, index) => (
          <InventorySlot
            key={`${inventory.type}-${inventory.id}-${item.slot}`}
            item={item}
            ref={index === (page + 1) * PAGE_SIZE - 1 ? ref : null}
            inventoryType={inventory.type}
            inventoryGroups={inventory.groups}
            inventoryId={inventory.id}
          />
        ))}
      </div>
    </div>
  );
};

export default InventoryGrid;
