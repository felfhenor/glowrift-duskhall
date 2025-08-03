# Glowrift Duskhall

## Setup

1. `npm install`
1. `npm run setup`

## Development

1. ` npm start`

## Tools Used

- [Angular](https://angular.io/) (for the frontend framework)
- [ngxstension](https://ngxtension.netlify.app/) (for extending angular in impactful ways)
- [TailwindCSS](https://tailwindcss.com/docs) (for styling)
- [DaisyUI](https://daisyui.com/components/) (for the UI components)
- [Helipopper](https://ngneat.github.io/helipopper/) (for tooltips)
- [Overview](https://github.com/ngneat/overview) (for teleporting content around the DOM)
- [Hot Toast](https://ngxpert.github.io/hot-toast/) (for notifications)
- [Pixi](https://pixijs.com/8.x/guides/getting-started/intro) (for map rendering)
- [SweetAlert2](https://github.com/sweetalert2/ngx-sweetalert2) (for alerts)

## AI Generation

### Talent Images

- Use [Sana](https://sana.hanlab.ai/)
- Default prompt: `an icon for a game that represents a talent, fully black background, no white corners, `
- Run through ImageMagick: `magick input.png -trim -resize 62x62 -gravity center -extent 64x64 -fill '#000' -opaque white -fuzz 20% -fill transparent -floodfill +0+0 black output.png`

This will:

- Make the image fit in the normal 64x64 space (without stretching)
- Replace all of the intermediary colors with black
- Replace all the black with transparent
- Add some padding around the image so it fits better visually
