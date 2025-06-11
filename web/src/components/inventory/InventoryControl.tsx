import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectItemAmount, setItemAmount } from '../../store/inventory';
import { DragSource } from '../../typings';
import { onUse } from '../../dnd/onUse';
import { onGive } from '../../dnd/onGive';
import { fetchNui } from '../../utils/fetchNui';
import { Locale } from '../../store/locale';
import UsefulControls from './UsefulControls';
import { Plus, RotateCcw, Minus, Handshake, Info } from 'lucide-react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const InventoryControl: React.FC = () => {
  const itemAmount = useAppSelector(selectItemAmount);
  const dispatch = useAppDispatch();

  const [infoVisible, setInfoVisible] = useState(false);

  const [, use] = useDrop<DragSource, void, any>(() => ({
    accept: 'SLOT',
    drop: (source) => {
      source.inventory === 'player' && onUse(source.item);
    },
  }));

  const [, give] = useDrop<DragSource, void, any>(() => ({
    accept: 'SLOT',
    drop: (source) => {
      source.inventory === 'player' && onGive(source.item);
    },
  }));

  const inputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Math.floor(event.target.valueAsNumber) || 0);
    dispatch(setItemAmount(value));
  };

  return (
    <>
      <UsefulControls infoVisible={infoVisible} setInfoVisible={setInfoVisible} />
      <button className="inventory-control-button-use" ref={use}>
        {Locale.ui_use || 'Use'}
      </button>
      <div className="inventory-control">
        <div className="inventory-control-wrapper vertical">
          <div className="inventory-control-row">
            <Tippy content={Locale.ui_give || 'Give'} theme='loop-theme'>
              <button
                className="inventory-control-button-icon"
                ref={give}
              >
                <Handshake />
              </button>
            </Tippy>

            <button
              className="inventory-control-button-icon"
              onClick={() => dispatch(setItemAmount(Math.max(0, itemAmount - 1)))}
            >
              <Minus />
            </button>

            <input
              className="inventory-control-input"
              type="number"
              value={itemAmount}
              onChange={inputHandler}
              min={0}
            />

            <button className="inventory-control-button-icon" onClick={() => dispatch(setItemAmount(itemAmount + 1))}>
              <Plus />
            </button>

            <button className="inventory-control-button-icon" onClick={() => dispatch(setItemAmount(0))}>
              <RotateCcw />
            </button>
          </div>
        </div>
      </div>

      <button className="useful-controls-button" onClick={() => setInfoVisible(true)}>
        <Info />
      </button>
    </>
  );
};

export default InventoryControl;