# Finnish Politician Landing Page

A modern, responsive landing page for a Finnish politician from the Kokoomus party. This website features a unique content transition effect where instead of traditional scrolling, the content stays in a fixed position while new content fades in as users scroll.

## Features

- **Modern, Professional Design**: Clean layout with Kokoomus party colors (blue tones)
- **Responsive**: Looks great on all devices (desktop, tablet, mobile)
- **Unique Content Transitions**: Content stays in place while new sections fade in as you scroll
- **Sections Include**:
  - Hero/Home
  - About
  - Policy Positions
  - Achievements
  - Contact Form
- **Fully Customizable**: Easy to update with your content and branding

## How to Use

1. **Setup**:
   - Simply open `index.html` in a web browser to view the site locally
   - Upload the entire folder to your web hosting to publish the site

2. **Customization**:
   - **Text Content**: Edit the text in `index.html` to reflect the politician's information
   - **Images**: Replace the placeholder images in the `assets` folder with actual images:
     - `logo.png` - Party logo or personal brand logo
     - `politician.jpg` - Main hero image of the politician
     - `about.jpg` - Secondary image for the About section
   - **Colors**: The primary colors are set up to match Kokoomus party colors, but you can adjust them in `styles.css`:
     - `--primary-color: #006288;` (Blue)
     - `--secondary-color: #003a54;` (Darker blue)
     - `--accent-color: #e5f2f8;` (Light blue)
     - `--highlight-color: #ffa300;` (Yellow/Orange accent)

3. **Contact Form**:
   - The contact form is currently set up for demonstration only
   - To make it functional, you'll need to add form processing (PHP or a form service)

## Understanding the Fixed-Position Content Transition

This website uses a unique approach to content presentation:

- Rather than the traditional scrolling where content moves up and out of view, this site keeps content in a fixed position
- When you scroll, the current content fades out and the next content fades in at the same position
- This creates a more focused, presentation-like experience for each section

The effect is achieved through:

- Fixed positioning of sections in CSS
- JavaScript scroll detection that manages the fade transitions
- A virtual scrolling area that allows users to navigate through content using familiar scrolling motions
- Support for keyboard navigation (arrow keys), mouse wheel, and navigation links

## Customizing the Transition Effect

The content transition effect can be customized in several ways:

- **Fade Speed**: Adjust the transition times in the CSS (`.section` transition property)
- **Timing**: Modify the timing parameters in the JavaScript file
- **Additional Effects**: You can add more transition effects in the CSS classes like `.active-entering` and `.active-leaving`

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Responsive design works on all modern mobile browsers

## Credits

- Font Awesome for icons
- Google Fonts (Open Sans)

## Kokoomus Party Information

The National Coalition Party (Kokoomus) is a center-right political party in Finland. The design colors were chosen to match the party's official branding.

---

To customize this landing page for a different politician or party, simply replace the content, images, and adjust the color scheme as needed.