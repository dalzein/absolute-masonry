# absolute-masonry
JavaScript library to create masonry layouts with draggable UI elements

## How to use

1. The HTML elements you wish to sort must be of equal width and must be styled with `position: absolute`
2. The parent container wrapper these elements must be styled with `position: relative`
3. Include `absolute-masonry.js` in the `<head>` of your html file
4. To initialise the library, call the `absoluteMasonryInit` function available on the global (window) object as follows:
```js
absoluteMasonryInit({
  containerClassName: "masonry-container", // The class name of the container wrapping the items - Ensure the element has relative positioning
  itemClassName: "masonry-item", // The class name of the elements to be sorted - Ensure the elements have absolute positioning
  itemWidth: 100, // The width of the elements to be sorted. Unit is px - Ensure the elements are of equal width
  gapSize: 5, // OPTIONAL - The gap between each element to be sorted. Default value is 10. Unit is px
  draggable: true, // OPTIONAL - Whether or not you want the elements to be draggable and repositionable. Default value is false
})
```
### Creating draggable elements
If `draggable` is set to true, all elements MUST include an `amId` attribute with a unique string value. When the items are repositioned, the new order/positions are made available on the global (window) object under the property `amItemPositions`. This property is an array of strings (the provided `amId` attribute values), reflecting their new order where the index is the position of the element. This is done so that you can access the new positions properly - for example, if you wish to store the order permanently.

## Masonry layout example
![Alt Text](https://media.giphy.com/media/LlVYWCKAXbGvnMERLH/giphy.gif)

## Draggable example
![Alt Text](https://media.giphy.com/media/iDGi96gbsCVySZeKMI/giphy.gif)



