import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';
const { Box, Label, Button } = Widget;
const { execAsync } = Utils;

// Simple material symbols that should work by default
const ICONS = {
    smartphone: '󰄜',
    computer: '󰇄',
    ring: '󰂚',
    send: '󰁝',
    keyboard: '󰌌',
    camera: '󰄀',
    clipboard: '󰅌',
    message: '󰍉',
};

const ActionButton = ({ icon, label, onClick }) => Button({
    className: 'action-button',
    css: `
        padding: 8px;
        margin: 2px;
        border-radius: 8px;
        background-color: rgba(255, 255, 255, 0.05);
    `,
    onClicked: onClick,
    child: Box({
        homogeneous: false,
        spacing: 8,
        children: [
            Label({
                label: ICONS[icon] || icon,
                className: 'txt txt-norm',
            }),
            Label({
                label: label,
                className: 'txt-small',
                hexpand: true,
                xalign: 0,
            }),
        ],
    }),
});

const DeviceControls = (device) => Box({
    vertical: true,
    className: 'device-box',
    css: `
        background-color: rgba(0, 0, 0, 0.2);
        padding: 12px;
        border-radius: 12px;
        margin: 4px 0;
    `,
    children: [
        Box({
            className: 'spacing-h-5',
            children: [
                Label({
                    label: device.isPhone ? ICONS.smartphone : ICONS.computer,
                    className: 'txt txt-large',
                }),
                Label({
                    label: device.name,
                    className: 'txt-small txt-bold',
                    xalign: 0,
                    hexpand: true,
                }),
                device.hasBattery && Label({
                    label: `${device.batteryLevel}%`,
                    className: 'txt-small',
                    css: `
                        background-color: rgba(255, 255, 255, 0.1);
                        padding: 2px 8px;
                        border-radius: 8px;
                    `,
                }),
            ],
        }),
        Box({
            className: 'spacing-h-5',
            css: 'margin-top: 8px;',
            children: [
                ActionButton({
                    icon: 'ring',
                    label: 'Ring',
                    onClick: () => execAsync(`kdeconnect-cli -d ${device.id} --ring`),
                }),
                ActionButton({
                    icon: 'send',
                    label: 'Send',
                    onClick: () => execAsync(`kdeconnect-cli -d ${device.id} --share-file`),
                }),
                ActionButton({
                    icon: 'keyboard',
                    label: 'Input',
                    onClick: () => execAsync(`kdeconnect-cli -d ${device.id} --remote-control`),
                }),
            ],
        }),
        Box({
            className: 'spacing-h-5',
            css: 'margin-top: 4px;',
            children: [
                ActionButton({
                    icon: 'camera',
                    label: 'Photo',
                    onClick: () => execAsync(`kdeconnect-cli -d ${device.id} --photo`),
                }),
                ActionButton({
                    icon: 'clipboard',
                    label: 'Paste',
                    onClick: () => execAsync(`kdeconnect-cli -d ${device.id} --share-text "$(xclip -o -selection clipboard)"`),
                }),
                ActionButton({
                    icon: 'message',
                    label: 'SMS',
                    onClick: () => execAsync(`kdeconnect-cli -d ${device.id} --send-sms`),
                }),
            ],
        }),
    ],
});

const KdeConnectPanel = () => {
    const updateDevices = async () => {
        const devices = await execAsync('kdeconnect-cli -a --id-name-only')
            .then(output => {
                return output.split('\n')
                    .filter(line => line.length > 0)
                    .map(line => {
                        const [id, name] = line.split('\t');
                        return { id, name };
                    });
            })
            .catch(() => []);

        // Get additional device info
        const devicesWithInfo = await Promise.all(devices.map(async (device) => {
            const batteryLevel = await execAsync(`kdeconnect-cli -d ${device.id} --battery`)
                .then(out => parseInt(out.match(/(\d+)/)?.[1] || '0'))
                .catch(() => 0);

            return {
                ...device,
                batteryLevel,
                hasBattery: batteryLevel > 0,
                isPhone: true // You might want to detect this properly
            };
        }));

        return devicesWithInfo;
    };

    const content = Box({
        vertical: true,
        className: 'kdeconnect-panel spacing-v-10',
    });

    const update = () => {
        updateDevices().then(devices => {
            content.children = devices.length > 0
                ? devices.map(device => DeviceControls(device))
                : [Label({
                    label: 'No devices connected',
                    className: 'txt-small txt'
                })];
        });
    };

    // Initial update
    update();

    // Update every 5 seconds
    Utils.interval(5000, update);

    return content;
};

export default KdeConnectPanel;
