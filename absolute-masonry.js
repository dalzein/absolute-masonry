// Initialise class names for the container and items to be arranged
function absoluteMasonryInit({
  containerClassName,
  itemClassName,
  itemWidth,
  gapSize = 10,
  draggable = false,
}) {
  window.amContainerClassName = containerClassName;
  window.amItemClassName = itemClassName;
  window.amItemWidth = itemWidth;
  window.amGapSize = gapSize;

  sortItems();

  if (draggable) {
    addMouseEventListeners();
  } else {
    removeMouseEventListeners();
  }
}

// We need a debouncer as the resize event fires rapidly
function debounce(func) {
  let timer;
  return function (event) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(func, 100, event);
  };
}

// Masonry sorting algorithm using absolute positioning
function sortItems(force = false) {
  // Determine the number of possible columns for our masonry sorting algorithm
  const containerRef = document.getElementsByClassName(
    window.amContainerClassName
  )[0];
  const containerWidth = containerRef.offsetWidth;
  let columnCount = Math.floor(
    (containerWidth + amGapSize) / (amItemWidth + amGapSize)
  );
  columnCount = columnCount === 0 ? 1 : columnCount;

  // If the column count is still the same we don't need to do anything
  if (window.amColumnCount === columnCount && !force) return;

  // Update the column count
  window.amColumnCount = columnCount;

  let items = [];
  if (window.amItemPositions) {
    amItemPositions.forEach((item) => {
      items.push(document.querySelector(`[data-amid=${item}]`));
    });
  } else {
    items = document.getElementsByClassName(amItemClassName);
  }

  const columnHeights = [];

  for (let i = 0; i < items.length; i++) {
    if (i < columnCount) {
      // Move item to top row and add a new column record in the column heights array with the height of the item
      items[i].style.transform = `translate(${
        amItemWidth * i + amGapSize * i
      }px, 0px)`;
      columnHeights.push(items[i].offsetHeight);
    } else {
      // Decide item location based on minimum column height
      const minColumnHeight = Math.min(...columnHeights);
      const columnIndex = columnHeights.indexOf(minColumnHeight);
      items[i].style.transform = `translate(${
        amItemWidth * columnIndex + amGapSize * columnIndex
      }px, ${minColumnHeight + amGapSize}px)`;
      columnHeights[columnIndex] += items[i].offsetHeight + amGapSize;
    }
  }

  containerRef.style.height = `${Math.max(...columnHeights)}px`;
}

function moveItem(x, y, identifier) {
  const items = [];
  amItemPositions.forEach((item) => {
    items.push(document.querySelector(`[data-amId=${item}]`));
  });
  const columnHeights = [];
  const containerRef = document.getElementsByClassName(
    window.amContainerClassName
  )[0];
  const { x: containerX, y: containerY } = containerRef.getBoundingClientRect();
  let offset = 0;
  let gap = 0;
  let newPositionIndex;
  let moveTargetToEnd = true;

  // Loop through the items and determine their new locations
  for (let i = 0; i < items.length; i++) {
    if (!items[i].classList.contains("dragging")) {
      if (i + offset - gap < amColumnCount) {
        // Determine if this item is at the position where our cursor is (if so, this is the offset point)
        if (
          containerX +
            amItemWidth * (i - gap) +
            amGapSize * (i - gap) +
            amItemWidth >=
            x &&
          containerX +
            amItemWidth * (i - gap) +
            amGapSize * (i - gap) -
            amGapSize <=
            x &&
          containerY + items[i].offsetHeight >= y &&
          containerY <= y
        ) {
          // We found where the cursor is, set the offset flag, set the new position of the item being dragged and add its height to the column heights array
          columnHeights.push(amMouseDragData.target.offsetHeight);
          offset = 1;
          newPositionIndex = i - gap;
          moveTargetToEnd = false;

          // Taking into account the offset and potential gap, check if the item will still fit in the top row
          if (i + offset - gap < amColumnCount) {
            // Item can sit in the top row
            items[i].style.transform = `translate(${
              amItemWidth * (i + offset - gap) + amGapSize * (i + offset - gap)
            }px, 0px)`;
            columnHeights.push(items[i].offsetHeight);
          } else {
            // Top row full, decide item location based on minimum column height and update the height for that column
            const minColumnHeight = Math.min(...columnHeights);
            const columnIndex = columnHeights.indexOf(minColumnHeight);
            items[i].style.transform = `translate(${
              amItemWidth * columnIndex + amGapSize * columnIndex
            }px, ${minColumnHeight + amGapSize}px)`;
            columnHeights[columnIndex] += items[i].offsetHeight + amGapSize;
          }
        } else {
          // Move item to top row and add a new column record in the column heights array with the height of the item
          items[i].style.transform = `translate(${
            amItemWidth * (i + offset - gap) + amGapSize * (i + offset - gap)
          }px, 0px)`;
          columnHeights.push(items[i].offsetHeight);
        }
      } else {
        // Item wont fit in top row, check if cursor is currently at location where we'd normally put this item
        let minColumnHeight = Math.min(...columnHeights);
        let columnIndex = columnHeights.indexOf(minColumnHeight);
        if (
          containerX +
            amItemWidth * columnIndex +
            amGapSize * columnIndex +
            amItemWidth >=
            x &&
          containerX +
            amItemWidth * columnIndex +
            amGapSize * columnIndex -
            amGapSize <=
            x &&
          containerY + minColumnHeight + items[i].offsetHeight + amGapSize >=
            y &&
          containerY + minColumnHeight <= y
        ) {
          // We found where the cursor is, set the new position of the item being dragged and add its height to the column heights array
          newPositionIndex = i - gap;
          moveTargetToEnd = false;
          columnHeights[columnIndex] +=
            amMouseDragData.target.offsetHeight + amGapSize;
          minColumnHeight = Math.min(...columnHeights);
          columnIndex = columnHeights.indexOf(minColumnHeight);

          // Decide item location based on minimum column height and update the height for that column
          items[i].style.transform = `translate(${
            amItemWidth * columnIndex + amGapSize * columnIndex
          }px, ${minColumnHeight + amGapSize}px)`;
          columnHeights[columnIndex] += items[i].offsetHeight + amGapSize;
        } else {
          // Decide item location based on minimum column height and update the height for that column
          items[i].style.transform = `translate(${
            amItemWidth * columnIndex + amGapSize * columnIndex
          }px, ${minColumnHeight + amGapSize}px)`;
          columnHeights[columnIndex] += items[i].offsetHeight + amGapSize;
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

  if (identifier) {
    const newPositions = amItemPositions;
    const index = newPositions.indexOf(identifier);
    newPositions.splice(index, 1);
    newPositions.splice(newPositionIndex, 0, identifier);
    amItemPositions = newPositions;
  }
}

function handleMouseDown(e) {
  // Ignore right click
  if (e.button === 2) return;

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("touchmove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
  document.addEventListener("touchend", handleMouseUp);

  // Mobile and touch devices use e.changedTouches
  if (e.changedTouches && e.changedTouches.length) {
    e = e.changedTouches[0];
  }

  e.target.classList.add("dragging");
  e.target.style.transition = "none";
  e.target.style.zIndex = "1000";

  const { x: itemX, y: itemY } = e.target.getBoundingClientRect();
  const { x: containerX, y: containerY } = document
    .getElementsByClassName(amContainerClassName)[0]
    .getBoundingClientRect();

  amMouseDragData = {
    ...amMouseDragData,
    mouseDeltaThreshold: 6,
    containerX,
    containerY,
    xStart: e.pageX,
    yStart: e.pageY,
    xOffset: e.pageX - itemX,
    yOffset: e.pageY - itemY,
    x: e.pageX,
    y: e.pageY,
    down: true,
    target: e.target,
  };
}

function handleMouseMove(e) {
  if (e.changedTouches && e.changedTouches.length) {
    e = e.changedTouches[0];
  }

  const deltaX = Math.abs(e.pageX - amMouseDragData.xStart);
  const deltaY = Math.abs(e.pageY - amMouseDragData.yStart);

  // Determine if we're either just clicking on or dragging the item based on movement delta
  if (
    deltaX > amMouseDragData.mouseDeltaThreshold ||
    deltaY > amMouseDragData.mouseDeltaThreshold ||
    amMouseDragData.dragging
  ) {
    amMouseDragData.target.style.transform = `translate(${
      amMouseDragData.x -
      amMouseDragData.xOffset -
      amMouseDragData.containerX -
      1
    }px, ${
      amMouseDragData.y -
      amMouseDragData.yOffset -
      amMouseDragData.containerY -
      1
    }px)`;

    moveItem(e.pageX, e.pageY);
    amMouseDragData = {
      ...amMouseDragData,
      x: e.pageX,
      y: e.pageY,
      dragging: true,
    };
  }
}

function handleMouseUp(e) {
  e.preventDefault();

  if (e.changedTouches && e.changedTouches.length) {
    e = e.changedTouches[0];
  }

  if (amMouseDragData.dragging) {
    const identifier = amMouseDragData.target.getAttribute("data-amId");

    moveItem(e.pageX, e.pageY, identifier);

    amMouseDragData.target &&
      amMouseDragData.target.classList.remove(["dragging"]);
    amMouseDragData.target &&
      (amMouseDragData.target.style.transition = "transform 0.2s linear");

    sortItems(true);

    const items = document.getElementsByClassName(amItemClassName);
    for (let i = 0; i < items.length; i++) {
      items[i].style.zIndex = 1;
    }
  }

  amMouseDragData = {
    ...amMouseDragData,
    down: false,
    dragging: false,
    target: null,
  };

  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("touchmove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);
  document.removeEventListener("touchend", handleMouseUp);
}

// Add mouse event listeners
function addMouseEventListeners() {
  window.amMouseDragData = {
    xStart: 0,
    yStart: 0,
    xOffset: 0,
    yOffset: 0,
    x: 0,
    y: 0,
    down: false,
    containerX: 0,
    containerY: 0,
    dragging: false,
    mouseDeltaThreshold: 6,
    target: null,
  };

  window.amItemPositions = [];
  const items = document.getElementsByClassName(amItemClassName);
  for (let i = 0; i < items.length; i++) {
    items[i].addEventListener("mousedown", handleMouseDown);
    items[i].addEventListener("touchstart", handleMouseDown);
    items[i].style.transition = "transform 0.2s linear";
    items[i].style.touchAction = "none";
    amItemPositions.push(items[i].getAttribute("data-amId"));
  }
}

// Remove mouse event listeners
function removeMouseEventListeners() {
  const items = document.getElementsByClassName(amItemClassName);
  for (let i = 0; i < items.length; i++) {
    items[i].removeEventListener("mousedown", handleMouseDown);
    items[i].removeEventListener("touchstart", handleMouseDown);
  }
}

window.onresize = debounce(sortItems);
