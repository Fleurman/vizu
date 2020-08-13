# Vizu
A simple and customizable image viewer


# API

- `Vizu.open(data,index=1)` opens the viewer

The `data` parameter must be an object or an array of objects containing the `url` and `title` properties.
If a single object is passed, the viewer will open in single image mode so the arrows and index are not displayed.

- `Vizu.close()` programatically closes the viewer

### Events

- `Vizu.addVizuListener(key,function)` attach a function to one of the customs Vizu events

the 14 events are: 
  - `open`      fired when the viewer opens<br>
  The argument passed is `{ data: data, id: id }` as given on the `Vizu.open()` call.

  - `close`     fired when the viewer closes
  
  - `next`, `previous`  fired when a navigation happens<br>
  The arguments passed are `{id:Gallery.id},element` where `element` is the `HTML` element of the corresponding arrow.
  
  - `view`  fired when the viewed picture has loaded<br>
  The arguments passed are `{ value: url }, img` where `img` is the `HTML` image element.
  
  - `title`  fired when the title element `innerHTML` is set<br>
  The arguments passed are `{ value: title }, element` where `element` is the `HTML` element of the title.
  
  - `count`  fired when the count element content is set<br>
  The arguments passed are `{ id: id, size: size }, element` where `element` is the `HTML` element of the count.
  
  - `preOpen`,`preClose`,`preNext`,`prePrevious`,`preView`,`preTitle`,`preCount` are fired before any changes are made


- `Vizu.removeVizuListener(key,function)`

### Configuration

- `Vizu.setConfig(object)` sets one or more of these parameters:

```javascript
{
    transition: "0.3s",     // the fading time between pictures
    arrowNavigation:false,  // navigating with the keyboard arrows ?
    touchNavigation:true,   // navigating by clicking on the right or left side of the picture ?
    closeBackground: false, // does clicking on the background close the viewer ?
    closeButton: true       // is the close button displayed ?
}
```

- `Vizu.getConfig()` retrieve the current parameters.


## CSS

Vizu comes with a small CSS sheet easily customizable.

As the viewer is a single ;HTML element, each part of it can be accessed by their ;id attribute:
```css
#Vizu{}
#VizuScreen{}
#VizuTitle{}
#VizuCount{}
.VizuArrow{}
#VizuPrevious{}
#VizuNext{}
```
