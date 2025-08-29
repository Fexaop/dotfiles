import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';

const { execAsync } = Utils;
const { Box, FlowBox, Label, Button } = Widget;

// Website shortcuts
const websiteShortcuts = [
    { name: 'Chess.com', url: 'https://www.chess.com', icon: '󰈓' },
    { name: 'Gaurish.xyz', url: 'https://gaurish.xyz', icon: '' },
    { name: 'Chat.gaurish.xyz', url: 'https://chat.gaurish.xyz', icon: '' },
    { name: 'Github', url: 'https://github.com/gaurishmehra', icon: '' },
];

// CLI shortcuts
const cliShortcuts = [
    { name: 'Adb', command: 'adb connect 192.168.29.208:5555', icon: '' },
    { name: 'Check Disk Space', command: 'df -h', icon: '' },
    { name: 'Ping Arch', command: 'ping archlinux.org -c 5', icon: '' },
];

// Website shortcut handler
const WebsiteShortcut = (shortcut) => Button({
    className: 'shortcut-button',
    css: `
        padding: 8px;
        margin: 2px;
        border-radius: 8px;
        background-color: rgba(255, 255, 255, 0.05);
    `,
    onClicked: async () => {
        try {
            await execAsync(`hyprctl dispatch workspace 2`);
            await execAsync(`xdg-open ${shortcut.url}`);
        } catch (error) {
            execAsync(`notify-send "Error opening ${shortcut.name}" "${error.message}"`);
        }
    },
    child: Box({
        homogeneous: false,
        spacing: 8,
        children: [
            Label({ label: shortcut.icon, className: 'txt txt-norm' }),
            Label({ label: shortcut.name, className: 'txt-small', hexpand: true, xalign: 0 }),
        ],
    }),
});

// CLI shortcut handler
const CliShortcut = (shortcut) => Button({
    className: 'shortcut-button',
    css: `
        padding: 8px;
        margin: 2px;
        border-radius: 8px;
        background-color: rgba(255, 255, 255, 0.05);
    `,
    onClicked: () => {
        execAsync(`notify-send "Executing ${shortcut.name}" "Please wait..."`);
        execAsync(`bash -c "${shortcut.command}"`).then(output => {
            execAsync(`notify-send "${shortcut.name}" "${output.trim() || 'Command executed successfully'}"`);
        }).catch(error => {
            execAsync(`notify-send "Error executing ${shortcut.name}" "${error.message}"`);
        });
    },
    child: Box({
        homogeneous: false,
        spacing: 8,
        children: [
            Label({ label: shortcut.icon, className: 'txt txt-norm' }),
            Label({ label: shortcut.name, className: 'txt-small', hexpand: true, xalign: 0 }),
        ],
    }),
});

// Shortcuts module
const ModuleShortcuts = () => {
    const websiteFlowBox = FlowBox({
        className: 'spacing-h-5',
        homogeneous: false,
        minChildrenPerLine: 2,
        maxChildrenPerLine: 4,
    });
    websiteShortcuts.forEach(shortcut => websiteFlowBox.add(WebsiteShortcut(shortcut)));

    const cliFlowBox = FlowBox({
        className: 'spacing-h-5',
        homogeneous: false,
        minChildrenPerLine: 2,
        maxChildrenPerLine: 4,
    });
    cliShortcuts.forEach(shortcut => cliFlowBox.add(CliShortcut(shortcut)));

    return Box({
        vertical: true,
        className: 'shortcuts-box spacing-v-10',
        children: [
            Label({ label: 'Websites', className: 'txt txt-small txt-bold', xalign: 0 }),
            websiteFlowBox,
            Label({ label: 'CLI Commands', className: 'txt txt-small txt-bold', xalign: 0 }),
            cliFlowBox,
        ],
    });
};

// Main Sidebar Widget
export default () => Box({
    vexpand: true,
    hexpand: true,
    // css: 'min-width: 2px;',
    css: 'min-width: 2px; background-color: rgba(0,0,0,0);',

    children: [
        Box({
            vertical: true,
            vexpand: true,
            className: 'sidebar-right spacing-v-15',
            css: 'background-color: rgba(0,0,0,0); border: 1px solid rgba(255, 255, 255, 0.5); min-height: 30px;',
            children: [
                ModuleShortcuts(),
            ],
        }),
    ],
});
