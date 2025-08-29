import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import Hyprland from 'resource:///com/github/Aylur/ags/service/hyprland.js';

const formatAppName = (className) => {
    // Handle org.name.desktop pattern
    if (className.includes('.')) {
        const parts = className.split('.');
        // If ends with .desktop, use second-to-last part
        const namePart = parts[parts.length - 1] === 'desktop' 
            ? parts[parts.length - 2]
            : parts[parts.length - 1];
            
        return namePart
            .replace(/[-_]/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    // Handle other cases (like firefox, code-oss)
    return className
        .replace(/[-_]/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

export default () => Widget.Label({
    className: 'txt-norm bar-windowtitle',
    setup: self => self.hook(Hyprland.active.client, () => {
        const title = Hyprland.active.client.title || 'Arch Linux';
        const rawClassName = Hyprland.active.client.class || 'Hyprland';
        const className = formatAppName(rawClassName);
        const separator = '  |  ';
        const maxTitleLength = 30;

        // Only truncate the title if needed
        const truncatedTitle = title.length > maxTitleLength 
            ? title.substring(0, maxTitleLength - 3) + '...'
            : title;
            
        self.label = `${truncatedTitle}${separator}${className}`;
    }),
});
