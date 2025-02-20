# absolute-masonry

A JavaScript library for creating reorderable masonry layouts.

## Masonry layout?

A masonry layout is where elements are arranged in a grid but are not constrained to uniform row heights. Instead, items are placed in an optimal position based on available vertical space, much like a mason fitting stones into a wall, hence the name.

## How it works

Virtual columns are created based on the available width (determined by the container) and the specified item widths. The location of each item is determined based on whichever column is the shortest at the time. The item's height is then added to that column. This repeats for each item. This implementation relies on absolute positioning as the item is being placed at a specific location using `transform`.

The dragging/reordering functionality is achieved with the same algorithm but by skipping over the item being dragged, and inserting a gap with the item's dimensions wherever the cursor is encountered.

## How to use it

1. The HTML elements you wish to sort must all be of equal width and must be siblings
2. Include the `absolute-masonry.js` script in the `<head>` of your HTML
3. To initialise the library, call `absoluteMasonry.init(...)` - the absoluteMasonry object is available on the global (`window`) object

### Simple example

HTML

```html
<div class="cards-wrapper">
  <div class="card" data-amId="1"></div>
  <div class="card" data-amId="2"></div>
  <div class="card" data-amId="3"></div>
  <div class="card" data-amId="4"></div>
</div>
```

CSS

```css
.card {
  width: 100px;
  border: 1px solid red;
}

[data-amId="1"] {
  height: 40px;
}

[data-amId="2"] {
  height: 80px;
}

[data-amId="3"] {
  height: 60px;
}

[data-amId="4"] {
  height: 120px;
}
```

JavaScript

```js
absoluteMasonry.init({
  containerClassName: "cards-wrapper", // The class name of the container wrapping the items - the script will force this element to have relative positioning
  itemClassName: "card", // The class name of the elements to be sorted - the script will force these elements to have absolute positioning
  itemWidth: 100, // The width of the elements to be sorted. Unit is px
  gapSize: 5, // OPTIONAL - The gap between each element to be sorted. Default value is 10. Unit is px
  draggable: true, // OPTIONAL - Whether or not you want the elements to be draggable and repositionable. Default value is false
  onItemPositionChange: (newPositions) => console.log(newPositions), // OPTIONAL - Callback function to receive new item position data after it has changed
});
```

### Creating draggable elements

If `draggable` is set to true, all elements MUST include an `amId` attribute with a unique string value. When the items are repositioned, the new order/positions are made available on the global (window) object under `absoluteMasonry.itemPositions`. This property is an array of strings (the provided `amId` attribute values), reflecting their new order where the index is the position of the element. This is done so that you can access the new positions.

You can also provide a callback function on init by assigning it to the `onItemPositionChange` property (see usage example above). The function will be called after the item order changes as a result of an item being dragged to a new position, and the `absoluteMasonry.itemPositions` value will be passed as an argument.

## Masonry layout example

![Alt Text](https://media.giphy.com/media/LlVYWCKAXbGvnMERLH/giphy.gif)

## Draggable example

![Alt Text](https://media.giphy.com/media/iDGi96gbsCVySZeKMI/giphy.gif)
