const servicesData = [
  {
    id: "motorola",
    name: "Motorola",
    type: "mobile",
    subtitle: "Mobile Care",
    desc: "Only Mobile Brand We Service. Certified Experts for Razr, Edge, and G Series.",
    badgeClass: "moto-badge",
    badgeText: "Specialist",
    logoType: "MotorolaLogo",
    accentColor: "var(--color-moto)",
    features: [
      "Genuine Motorola Parts",
      "Edge & Razr Display Repair",
      "Battery & Power Diagnosis"
    ],
    services: [
      {
        name: "Motorola Original Screen Assembly (Edge, Razr, G, Moto G Stylus)",
        tag: "Genuine OEM Parts Only",
        tagType: "info"
      },
      {
        name: "Genuine Motorola Battery Swap (Long-life replacement)",
        tag: "OEM Spec & Calibrated",
        tagType: "info"
      },
      {
        name: "USB-C Charging Port & Mic Board Replacement",
        tag: "Original Sub-Boards",
        tagType: "info"
      },
      {
        name: "Water Damage Ultrasonic Cleaning & Board Repair",
        tag: "Complimentary Diagnosis",
        tagType: "success"
      }
    ]
  },
  {
    id: "dell",
    name: "Dell",
    type: "laptop",
    subtitle: "Laptop Care",
    desc: "Complete Support for Inspiron, XPS, Latitude, Vostro, and G-Series.",
    badgeClass: "laptop-badge",
    badgeText: "Laptop Care",
    logoType: "DellLogo",
    accentColor: "var(--color-dell)",
    features: [
      "Motherboard Chipset repair",
      "Battery & Keyboard swap",
      "OS & SSD Upgrades"
    ],
    services: [
      {
        name: "High-Definition Laptop Display Replacement (IPS, OLED, 144Hz)",
        tag: "Color Calibrated",
        tagType: "info"
      },
      {
        name: "Motherboard IC Chip-level Repair (No Boot, Dead Board)",
        tag: "Micro-Soldering Work",
        tagType: "info"
      },
      {
        name: "Speed Upgrade (High-Speed NVMe SSD + 16GB/32GB DDR4/DDR5 RAM)",
        tag: "Speed & Storage Boost",
        tagType: "info"
      },
      {
        name: "Premium Keyboard & Mousepad Assembly Replacement",
        tag: "OEM Replacements",
        tagType: "info"
      }
    ]
  },
  {
    id: "hp",
    name: "HP",
    type: "laptop",
    subtitle: "Laptop Care",
    desc: "Expert Service for Pavilion, Envy, Spectre, Omen, and EliteBook.",
    badgeClass: "laptop-badge",
    badgeText: "Laptop Care",
    logoType: "HpLogo",
    accentColor: "var(--color-hp)",
    features: [
      "Hinge & Panel repair",
      "BIOS & Firmware flash",
      "Genuine Charger supply"
    ],
    services: [
      {
        name: "HP Premium LED Screen Replacement (FHD, UHD Touch)",
        tag: "Color Calibrated",
        tagType: "info"
      },
      {
        name: "Motherboard & BGA Chip Reballing Service",
        tag: "Micro-Soldering Work",
        tagType: "info"
      },
      {
        name: "RAM Expansion & SSD Upgrade for HP Pavilion/Omen",
        tag: "Performance Boost",
        tagType: "info"
      },
      {
        name: "OEM Laptop Battery Replacement with 6-Month Warranty",
        tag: "Safety Tested",
        tagType: "info"
      }
    ]
  },
  {
    id: "asus",
    name: "Asus",
    type: "laptop",
    subtitle: "Laptop Care",
    desc: "Dedicated Repair for ZenBook, VivoBook, ROG, TUF, and ProArt.",
    badgeClass: "laptop-badge",
    badgeText: "Laptop Care",
    logoType: "AsusLogo",
    accentColor: "var(--color-asus)",
    features: [
      "ROG/TUF Liquid Metal re-paste",
      "DC Jack & Port soldering",
      "Display replacement"
    ],
    services: [
      {
        name: "Asus ROG/TUF Liquid Metal Thermal Paste Repasting & Fan Cleanup",
        tag: "Advanced Cooling",
        tagType: "success"
      },
      {
        name: "Asus ZenBook Ultra-Slim Screen Assembly Replacement",
        tag: "OEM Calibration",
        tagType: "info"
      },
      {
        name: "Motherboard DC Jack Power Port Repair & Re-soldering",
        tag: "Micro-Soldering Work",
        tagType: "info"
      },
      {
        name: "Asus Keyboard Key/Backlight Circuit Repair",
        tag: "OEM Replacements",
        tagType: "info"
      }
    ]
  }
];

export default servicesData;
