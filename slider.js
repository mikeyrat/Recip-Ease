const slidesData = [
  {
    title: "Recipe Title 1",
    imgSrc: "./images/recipe01.png",
    text: "Recipe Description in Brief",
  },
  {
    title: "Recipe Title 2",
    imgSrc: "./images/recipe02.png",
    text: "Recipe Description in Brief.",
  },
  {
    title: "Recipe Title 3",
    imgSrc: "./images/recipe03.png",
    text: "Recipe Description in Brief",
  },
  {
    title: "Recipe Title 4",
    imgSrc: "./images/recipe04.png",
    text: "Recipe Description in Brief",
  },
  {
    title: "Recipe Title 5",
    imgSrc: "./images/recipe05.png",
    text: "Recipe Description in Brief.",
  },
];

const sliderContainer = document.getElementById("slider");

slidesData.forEach((slide) => {
  sliderContainer.innerHTML += `
          <div class="item">
            <h1>${slide.title}</h1>
            <img class="slider_card_img" src="${slide.imgSrc}" />
            <div>
            <p>${slide.text}</p>
            <a class="read_more" href="#">Read more</a></div>
            
          </div>
        `;
});

let items = document.querySelectorAll(".slider .item ");
console.log(items);
let next = document.getElementById("next");
let prev = document.getElementById("prev");

let active = 3;
function loadShow() {
  let stt = 0;
  items[active].style.transform = `none`;
  items[active].style.zIndex = 1;
  items[active].style.filter = "none";
  items[active].style.opacity = 1;
  for (var i = active + 1; i < items.length; i++) {
    stt++;
    items[i].style.transform = `translateX(${120 * stt}px) scale(${
      1 - 0.2 * stt
    }) perspective(16px) rotateY(-1deg)`;
    items[i].style.zIndex = -stt;
    items[i].style.filter = "blur(5px)";
    items[i].style.opacity = stt > 2 ? 0 : 0.6;
  }
  stt = 0;
  for (var i = active - 1; i >= 0; i--) {
    stt++;
    items[i].style.transform = `translateX(${-120 * stt}px) scale(${
      1 - 0.2 * stt
    }) perspective(16px) rotateY(1deg)`;
    items[i].style.zIndex = -stt;
    items[i].style.filter = "blur(5px)";
    items[i].style.opacity = stt > 2 ? 0 : 0.6;
  }
}
loadShow();
next.onclick = function () {
  active = active + 1 < items.length ? active + 1 : active;
  loadShow();
};
prev.onclick = function () {
  active = active - 1 >= 0 ? active - 1 : active;
  loadShow();
};
setInterval(() => {
  active = active + 1 < items.length ? active + 1 : 0;
  loadShow();
}, 2500);
