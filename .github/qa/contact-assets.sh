#!/usr/bin/env bash
set -euo pipefail
base=src/pages/ContactPage/components
mkdir -p "$base/ContactDetails/assets" "$base/ContactMap/assets" "$base/InquiryForm/assets" "$base/PhotoPicker/assets"
download() { curl --retry 3 --connect-timeout 20 -fsSL "$2" -o "$1"; test -s "$1"; }
download "$base/ContactDetails/assets/phone.svg" 'https://www.figma.com/api/mcp/asset/1d377f4d-eaab-43cd-a9bb-7c91b393ea6d.svg'
download "$base/ContactDetails/assets/mail.svg" 'https://www.figma.com/api/mcp/asset/7ec6744b-0c89-42ad-918d-cad9dd92e450.svg'
download "$base/ContactDetails/assets/location.svg" 'https://www.figma.com/api/mcp/asset/fc24c917-e148-4b6b-a4d8-434f325ec88f.svg'
download "$base/ContactDetails/assets/clock.svg" 'https://www.figma.com/api/mcp/asset/8ad95e85-36fa-42c5-be50-8a7594206060.svg'
download "$base/InquiryForm/assets/chevron-down.svg" 'https://www.figma.com/api/mcp/asset/86f26d56-a42b-4cf4-9c0b-a9dd7028db94.svg'
download "$base/PhotoPicker/assets/paperclip.svg" 'https://www.figma.com/api/mcp/asset/3ad1dd6a-85ac-4e0e-89eb-7f65aedccda8.svg'
download "$base/ContactMap/assets/waterway.svg" 'https://www.figma.com/api/mcp/asset/c033080a-23ca-415c-bff8-32b4ae7f07e6.svg'
download "$base/ContactMap/assets/pin-background.svg" 'https://www.figma.com/api/mcp/asset/6427c9e1-540b-4067-95ce-fbaaf7dd854a.svg'
download "$base/ContactMap/assets/pin.svg" 'https://www.figma.com/api/mcp/asset/b75c7926-7bcb-419e-a6d9-a98759977886.svg'
