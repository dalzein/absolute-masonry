window.absoluteMasonry = (() => {
  let _amContainerClassName;
  let _amItemClassName;
  let _amItemWidth;
  let _amGapSize;
  let _amColumnCount;
  let _amItemPositions = [];
  let _onItemPositionChange;

  // Initialise class names for the container and items to be arranged
  const init = ({
    containerClassName,
    itemClassName,
    itemWidth,
    gapSize = 10,
    draggable = false,
    onItemPositionChange,
  }) => {
    _amContainerClassName = containerClassName;
    _amItemClassName = itemClassName;
    _amItemWidth = itemWidth;
    _amGapSize = gapSize;
    _onItemPositionChange = onItemPositionChange;

    prepareEventListenersAndStyles(draggable);
    sortItems();
  };

  // We need a debouncer as the resize event fires rapidly
  const debounce = (func) => {
    let timer;
    return (event) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(func, 100, event);
    };
  };

  // Masonry sorting algorithm using absolute positioning
  const sortItems = (force = false) => {
    // Determine the number of possible columns for our masonry sorting algorithm
    const containerRef = document.getElementsByClassName(
      _amContainerClassName
    )[0];
    if (!containerRef) return;

    const containerWidth = containerRef.offsetWidth;
    let columnCount = Math.floor(
      (containerWidth + _amGapSize) / (_amItemWidth + _amGapSize)
    );
    columnCount = columnCount === 0 ? 1 : columnCount;

    // If the column count is still the same we don't need to do anything
    if (_amColumnCount === columnCount && !force) return;

    // Update the column count
    _amColumnCount = columnCount;

    let items = [];
    if (_amItemPositions) {
      for (const itemPosition of _amItemPositions) {
        const item = document.querySelector(`[data-amId="${itemPosition}"]`);
        if (!item) {
          console.error(
            `Couldn't find element with 'data-amId' attribute ${itemPosition} - ensure each draggable element has a unique 'data-amId' attribute value that does not change`
          );
          return;
        }
        items.push(item);
      }
    } else {
      items = document.getElementsByClassName(_amItemClassName);
    }

    const columnHeights = [];

    for (let i = 0; i < items.length; i++) {
      if (i < columnCount) {
        // Move item to top row and add a new column record in the column heights array with the height of the item
        items[i].style.transform = `translate(${
          _amItemWidth * i + _amGapSize * i
        }px, 0px)`;
        columnHeights.push(items[i].offsetHeight);
      } else {
        // Decide item location based on minimum column height
        const minColumnHeight = Math.min(...columnHeights);
        const columnIndex = columnHeights.indexOf(minColumnHeight);
        items[i].style.transform = `translate(${
          _amItemWidth * columnIndex + _amGapSize * columnIndex
        }px, ${minColumnHeight + _amGapSize}px)`;
        columnHeights[columnIndex] += items[i].offsetHeight + _amGapSize;
      }
    }

    containerRef.style.height = `${Math.max(...columnHeights)}px`;
  };

  const moveItem = (x, y, target) => {
    const items = [];
    for (const itemPosition of _amItemPositions) {
      const item = document.querySelector(`[data-amId="${itemPosition}"]`);
      if (!item) {
        console.error(
          `Couldn't find element with 'data-amId' attribute ${itemPosition} - ensure each draggable element has a unique 'data-amId' attribute value that does not change`
        );
        return;
      }
      items.push(item);
    }

    const columnHeights = [];
    const containerRef = document.getElementsByClassName(
      _amContainerClassName
    )[0];
    const { x: containerX, y: containerY } =
      containerRef.getBoundingClientRect();
    let offset = 0;
    let gap = 0;
    let newPositionIndex;
    let moveTargetToEnd = true;
    const scrollY = window.scrollY;

    // Loop through the items and determine their new locations
    for (let i = 0; i < items.length; i++) {
      if (!items[i].classList.contains("dragging")) {
        if (i + offset - gap < _amColumnCount) {
          // Determine if this item is at the position where our cursor is (if so, this is the offset point)
          if (
            containerX +
              _amItemWidth * (i - gap) +
              _amGapSize * (i - gap) +
              _amItemWidth >=
              x &&
            containerX +
              _amItemWidth * (i - gap) +
              _amGapSize * (i - gap) -
              _amGapSize <=
              x &&
            containerY + items[i].offsetHeight + scrollY >= y &&
            containerY + scrollY <= y
          ) {
            // We found where the cursor is, set the offset flag, set the new position of the item being dragged and add its height to the column heights array
            columnHeights.push(target.offsetHeight);
            offset = 1;
            newPositionIndex = i - gap;
            moveTargetToEnd = false;

            // Taking into account the offset and potential gap, check if the item will still fit in the top row
            if (i + offset - gap < _amColumnCount) {
              // Item can sit in the top row
              items[i].style.transform = `translate(${
                _amItemWidth * (i + offset - gap) +
                _amGapSize * (i + offset - gap)
              }px, 0px)`;
              columnHeights.push(items[i].offsetHeight);
            } else {
              // Top row full, decide item location based on minimum column height and update the height for that column
              const minColumnHeight = Math.min(...columnHeights);
              const columnIndex = columnHeights.indexOf(minColumnHeight);
              items[i].style.transform = `translate(${
                _amItemWidth * columnIndex + _amGapSize * columnIndex
              }px, ${minColumnHeight + _amGapSize}px)`;
              columnHeights[columnIndex] += items[i].offsetHeight + _amGapSize;
            }
          } else {
            // Move item to top row and add a new column record in the column heights array with the height of the item
            items[i].style.transform = `translate(${
              _amItemWidth * (i + offset - gap) +
              _amGapSize * (i + offset - gap)
            }px, 0px)`;
            columnHeights.push(items[i].offsetHeight);
          }
        } else {
          // Item wont fit in top row, check if cursor is currently at location where we'd normally put this item
          let minColumnHeight = Math.min(...columnHeights);
          let columnIndex = columnHeights.indexOf(minColumnHeight);
          if (
            containerX +
              _amItemWidth * columnIndex +
              _amGapSize * columnIndex +
              _amItemWidth >=
              x &&
            containerX +
              _amItemWidth * columnIndex +
              _amGapSize * columnIndex -
              _amGapSize <=
              x &&
            containerY +
              minColumnHeight +
              items[i].offsetHeight +
              _amGapSize +
              scrollY >=
              y &&
            containerY + minColumnHeight + scrollY <= y
          ) {
            // We found where the cursor is, set the new position of the item being dragged and add its height to the column heights array
            newPositionIndex = i - gap;
            moveTargetToEnd = false;
            columnHeights[columnIndex] += target.offsetHeight + _amGapSize;
            minColumnHeight = Math.min(...columnHeights);
            columnIndex = columnHeights.indexOf(minColumnHeight);

            // Decide item location based on minimum column height and update the height for that column
            items[i].style.transform = `translate(${
              _amItemWidth * columnIndex + _amGapSize * columnIndex
            }px, ${minColumnHeight + _amGapSize}px)`;
            columnHeights[columnIndex] += items[i].offsetHeight + _amGapSize;
          } else {
            // Decide item location based on minimum column height and update the height for that column
            items[i].style.transform = `translate(${
              _amItemWidth * columnIndex + _amGapSize * columnIndex
            }px, ${minColumnHeight + _amGapSize}px)`;
            columnHeights[columnIndex] += items[i].offsetHeight + _amGapSize;
          }
        }
      } else {
        // We found the item being dragged, set the gap flag
        gap = 1;
      }
    }

    containerRef.style.height = `${Math.max(...columnHeights)}px`;

    //  If the item was dragged outside of the container move it to the end
    if (moveTargetToEnd) newPositionIndex = items.length - 1;

    const id = target?.getAttribute("data-amId");
    if (id) {
      const newPositions = _amItemPositions;
      const index = newPositions.indexOf(id);
      newPositions.splice(index, 1);
      newPositions.splice(newPositionIndex, 0, id);
      _amItemPositions = newPositions;
    }
  };

  const handleMouseDown = (downEvent) => {
    // Ignore right click
    if (downEvent.button === 2) return;

    // Mobile and touch devices use e.changedTouches
    if (downEvent.changedTouches && downEvent.changedTouches.length) {
      downEvent = downEvent.changedTouches[0];
    }

    // Mouse data to track
    const target = downEvent.target;
    const { x: itemX, y: itemY } = target.getBoundingClientRect();
    const { x: containerX, y: containerY } = document
      .getElementsByClassName(_amContainerClassName)[0]
      .getBoundingClientRect();
    const xStart = downEvent.pageX;
    const yStart = downEvent.pageY;
    const xOffset = downEvent.pageX - itemX;
    const yOffset = downEvent.pageY - itemY;
    const mouseDeltaThreshold = 6;
    let dragging = false;

    const handleMouseMove = (moveEvent) => {
      if (moveEvent.changedTouches && moveEvent.changedTouches.length) {
        moveEvent = moveEvent.changedTouches[0];
      }

      const deltaX = Math.abs(moveEvent.pageX - xStart);
      const deltaY = Math.abs(moveEvent.pageY - yStart);

      // Determine if we're dragging or not
      if (
        !dragging &&
        (deltaX > mouseDeltaThreshold || deltaY > mouseDeltaThreshold)
      ) {
        dragging = true;
        target.classList.toggle("dragging", true);
        target.style.transition = "none";
        target.style.zIndex = "1000";
      }

      if (dragging) {
        target.style.transform = `translate(${
          moveEvent.pageX - xOffset - containerX - 1
        }px, ${moveEvent.pageY - yOffset - containerY - 1}px)`;

        moveItem(moveEvent.pageX, moveEvent.pageY, target);
      }
    };

    const handleMouseUp = (upEvent) => {
      upEvent.preventDefault();

      if (upEvent.changedTouches && upEvent.changedTouches.length) {
        upEvent = upEvent.changedTouches[0];
      }

      // If we were dragging, update the new item positions if they've changed
      if (dragging) {
        moveItem(upEvent.pageX, upEvent.pageY, target);

        _onItemPositionChange && _onItemPositionChange(_amItemPositions);

        target.classList.remove(["dragging"]);
        target.style.transition = "transform 0.2s linear";

        sortItems(true);

        const items = document.getElementsByClassName(_amItemClassName);

        for (const item of items) {
          item.style.zIndex = 1;
        }
      }

      // Remove listeners
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchend", handleMouseUp);
  };

  const prepareEventListenersAndStyles = (draggable) => {
    _amItemPositions = [];
    const items = document.getElementsByClassName(_amItemClassName);
    const container = document.getElementsByClassName(_amContainerClassName)[0];
    container.style.position = "relative";

    for (const item of items) {
      if (draggable) {
        item.addEventListener("mousedown", handleMouseDown);
        item.addEventListener("touchstart", handleMouseDown);
        _amItemPositions.push(item.getAttribute("data-amId"));
      } else {
        item.removeEventListener("mousedown", handleMouseDown);
        item.removeEventListener("touchstart", handleMouseDown);
      }

      item.style.position = "absolute";
      item.style.transition = "transform 0.2s linear";
      item.style.touchAction = "none";
    }
  };

  window.onresize = debounce(sortItems);

  return {
    init,
    itemPositions: _amItemPositions,
  };
})();
