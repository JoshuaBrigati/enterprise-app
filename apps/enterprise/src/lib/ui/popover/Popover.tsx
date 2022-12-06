import { Placement } from '@popperjs/core';
import throttle from 'lodash/throttle';
import { ReactNode, useEffect, useState } from 'react';
import { usePopper } from 'react-popper';
import { useClickAway } from 'react-use';
import { useValueRef } from 'lib/shared/hooks/useValueRef';
import styled from 'styled-components';
import { BodyPortal } from 'lib/ui/BodyPortal';
import { useElementSize } from 'lib/ui/hooks/useElementSize';
import { ScreenCover } from 'lib/ui/ScreenCover';
import { zIndex } from 'lib/ui/zIndex';

export type PopoverPlacement = Placement;

interface PopoverProps {
  anchor: HTMLElement;
  children: ReactNode;
  placement?: PopoverPlacement;
  distance?: number;
  enableScreenCover?: boolean;
  onClickOutside?: () => void;
  isVisible?: boolean;
}

export const Popover = styled(
  ({
    anchor,
    children,
    onClickOutside,
    placement = 'auto',
    distance = 4,
    enableScreenCover = false,
    isVisible = true,
  }: PopoverProps) => {
    const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);

    const { styles, attributes, update } = usePopper(anchor, popperElement, {
      placement,
      strategy: 'fixed',

      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, distance],
          },
        },
        {
          name: 'preventOverflow',
          options: {
            padding: 8,
          },
        },
      ],
    });

    const poperRef = useValueRef(popperElement);
    useClickAway(poperRef, (event) => {
      if (anchor.contains(event.target as Node)) return;
      onClickOutside?.();
    });

    const size = useElementSize(popperElement);
    useEffect(() => {
      if (!update) return;

      throttle(update, 200);
    }, [size, update]);

    const popoverNode = (
      <Container ref={setPopperElement} style={styles.popper} {...attributes.popper}>
        {children}
      </Container>
    );

    if (!isVisible) return null;

    return (
      <BodyPortal>
        {enableScreenCover && <ScreenCover />}
        {popoverNode}
      </BodyPortal>
    );
  }
)``;

const Container = styled.div`
  position: relative;
  z-index: ${zIndex.menu};
`;
