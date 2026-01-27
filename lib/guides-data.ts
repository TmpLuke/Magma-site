export interface GuideStep {
  title: string;
  description: string;
  instructions: string[];
  downloadUrl?: string;
  downloadLabel?: string;
}

export interface Guide {
  id: string;
  game: string;
  slug: string;
  title: string;
  subtitle: string;
  steps: GuideStep[];
}

export interface GuideCategory {
  name: string;
  icon: string;
  guides: Guide[];
}

export const guideCategories: GuideCategory[] = [
  {
    name: "GAME CHEATS",
    icon: "gamepad",
    guides: [
      {
        id: "cod",
        game: "Call of Duty",
        slug: "call-of-duty",
        title: "Call of Duty Cheat",
        subtitle: "How to download and set up Call of Duty cheat",
        steps: [
          {
            title: "DirectX SDK Installation",
            description: "Install Microsoft DirectX SDK",
            instructions: [
              "Download DirectX SDK from the link below",
              "Run the installer and follow the installation wizard",
              "Wait for installation to complete before proceeding",
            ],
            downloadUrl: "https://www.microsoft.com/en-us/download/details.aspx?id=6812",
            downloadLabel: "Download DirectX SDK",
          },
          {
            title: "Visual C++ Redistributable",
            description: "Install VC++ Redistributable package",
            instructions: [
              "Download VC++ Redistributable from the link below",
              "Install the package",
              "Complete this step after DirectX SDK installation",
            ],
            downloadUrl: "https://aka.ms/vs/17/release/vc_redist.x64.exe",
            downloadLabel: "Download VC++ Redistributable",
          },
          {
            title: "Loader Download",
            description: "Download the Call of Duty loader",
            instructions: [
              "Download the loader from the link below",
              "Extract to a folder of your choice",
              "Run as Administrator",
            ],
            downloadUrl: "https://discord.gg/magmacheats",
            downloadLabel: "Download Loader",
          },
        ],
      },
      {
        id: "apex",
        game: "Apex Legends",
        slug: "apex-legends",
        title: "Apex Legends Cheat",
        subtitle: "How to download and set up Apex Legends cheat",
        steps: [
          {
            title: "DirectX SDK Installation",
            description: "Install Microsoft DirectX SDK",
            instructions: [
              "Download DirectX SDK from the link below",
              "Run the installer and follow the installation wizard",
              "Wait for installation to complete before proceeding",
            ],
            downloadUrl: "https://www.microsoft.com/en-us/download/details.aspx?id=6812",
            downloadLabel: "Download DirectX SDK",
          },
          {
            title: "Visual C++ Redistributable",
            description: "Install VC++ Redistributable package",
            instructions: [
              "Download VC++ Redistributable from the link below",
              "Install the package",
              "Complete this step after DirectX SDK installation",
            ],
            downloadUrl: "https://aka.ms/vs/17/release/vc_redist.x64.exe",
            downloadLabel: "Download VC++ Redistributable",
          },
          {
            title: "Action Recorder Installation",
            description: "Install Mirillis Action Recorder",
            instructions: [
              "Download Action Recorder from the link below",
              "Install with default settings",
              "Restart your PC after installation",
            ],
            downloadUrl: "https://discord.gg/magmacheats",
            downloadLabel: "Download Action Recorder",
          },
          {
            title: "Loader Download",
            description: "Download the Apex Legends loader",
            instructions: [
              "Download the loader from the link below",
              "Extract to a folder of your choice",
              "Run as Administrator",
            ],
            downloadUrl: "https://discord.gg/magmacheats",
            downloadLabel: "Download Loader",
          },
        ],
      },
      {
        id: "r6",
        game: "Rainbow Six Siege",
        slug: "rainbow-six-siege",
        title: "Rainbow Six Siege Cheat",
        subtitle: "How to download and set up Rainbow Six Siege cheat",
        steps: [
          {
            title: "Prerequisites",
            description: "System requirements check",
            instructions: [
              "Ensure Windows 10/11 is fully updated",
              "Disable Windows Defender real-time protection",
              "Add exclusion for the cheat folder",
            ],
          },
          {
            title: "Loader Download",
            description: "Download the Rainbow Six Siege loader",
            instructions: [
              "Download the loader from the link below",
              "Extract to a secure folder",
              "Run as Administrator before launching the game",
            ],
            downloadUrl: "https://discord.gg/magmacheats",
            downloadLabel: "Download Loader",
          },
        ],
      },
      {
        id: "fortnite",
        game: "Fortnite",
        slug: "fortnite",
        title: "Fortnite Cheat",
        subtitle: "How to download and set up Fortnite cheat",
        steps: [
          {
            title: "DirectX SDK Installation",
            description: "Install Microsoft DirectX SDK",
            instructions: [
              "Download DirectX SDK from the link below",
              "Run the installer and follow the installation wizard",
              "Wait for installation to complete before proceeding",
            ],
            downloadUrl: "https://www.microsoft.com/en-us/download/details.aspx?id=6812",
            downloadLabel: "Download DirectX SDK",
          },
          {
            title: "Visual C++ Redistributable",
            description: "Install VC++ Redistributable package",
            instructions: [
              "Download VC++ Redistributable from the link below",
              "Install the package",
              "Complete this step after DirectX SDK installation",
            ],
            downloadUrl: "https://aka.ms/vs/17/release/vc_redist.x64.exe",
            downloadLabel: "Download VC++ Redistributable",
          },
          {
            title: "Action Recorder Installation",
            description: "Install Mirillis Action Recorder",
            instructions: [
              "Download Action Recorder from the link below",
              "Install with default settings",
              "Restart your PC after installation",
            ],
            downloadUrl: "https://discord.gg/magmacheats",
            downloadLabel: "Download Action Recorder",
          },
        ],
      },
      {
        id: "marvel-rivals",
        game: "Marvel Rivals",
        slug: "marvel-rivals",
        title: "Marvel Rivals Cheat",
        subtitle: "How to download and set up Marvel Rivals cheat",
        steps: [
          {
            title: "Prerequisites",
            description: "Prepare your system",
            instructions: [
              "Ensure you have the latest game version",
              "Disable any overlays (Discord, Steam, etc.)",
              "Run the game once before using the cheat",
            ],
          },
          {
            title: "Loader Download",
            description: "Download the loader",
            instructions: [
              "Download the loader from the link below",
              "Run as Administrator",
              "Inject after the game is fully loaded",
            ],
            downloadUrl: "https://discord.gg/magmacheats",
            downloadLabel: "Download Loader",
          },
        ],
      },
      {
        id: "dbd",
        game: "Dead by Daylight",
        slug: "dead-by-daylight",
        title: "Dead by Daylight Cheat",
        subtitle: "How to download and set up Dead by Daylight cheat",
        steps: [
          {
            title: "Loader Download",
            description: "Download the DBD loader",
            instructions: [
              "Download the loader from the link below",
              "Extract and run as Administrator",
              "Start the game after injection",
            ],
            downloadUrl: "https://discord.gg/magmacheats",
            downloadLabel: "Download Loader",
          },
        ],
      },
      {
        id: "rust",
        game: "Rust",
        slug: "rust",
        title: "Rust Cheat",
        subtitle: "How to download and set up Rust cheat",
        steps: [
          {
            title: "EAC Bypass",
            description: "Prepare EasyAntiCheat bypass",
            instructions: [
              "Download the bypass tool from below",
              "Run before starting the game",
              "Wait for confirmation message",
            ],
            downloadUrl: "https://discord.gg/magmacheats",
            downloadLabel: "Download EAC Bypass",
          },
          {
            title: "Loader Download",
            description: "Download the Rust loader",
            instructions: [
              "Download the loader from below",
              "Extract and run as Administrator",
              "Inject when in the main menu",
            ],
            downloadUrl: "https://discord.gg/magmacheats",
            downloadLabel: "Download Loader",
          },
        ],
      },
      {
        id: "minecraft",
        game: "Minecraft",
        slug: "minecraft",
        title: "Minecraft Cheat",
        subtitle: "How to download and set up Minecraft cheat",
        steps: [
          {
            title: "Java Installation",
            description: "Install Java 17+",
            instructions: [
              "Download Java 17 or higher",
              "Install with default settings",
              "Verify installation in command prompt",
            ],
            downloadUrl: "https://discord.gg/magmacheats",
            downloadLabel: "Download Java",
          },
          {
            title: "Client Download",
            description: "Download the MC Client",
            instructions: [
              "Download the client from below",
              "Place in your .minecraft folder",
              "Select the profile in launcher",
            ],
            downloadUrl: "https://discord.gg/magmacheats",
            downloadLabel: "Download Client",
          },
        ],
      },
      {
        id: "csgo",
        game: "CS:GO",
        slug: "csgo",
        title: "CS:GO Cheat",
        subtitle: "How to download and set up CS:GO cheat",
        steps: [
          {
            title: "Loader Download",
            description: "Download the CS loader",
            instructions: [
              "Download the loader from below",
              "Run as Administrator",
              "Inject after reaching main menu",
            ],
            downloadUrl: "https://discord.gg/magmacheats",
            downloadLabel: "Download Loader",
          },
        ],
      },
      {
        id: "valorant",
        game: "Valorant",
        slug: "valorant",
        title: "Valorant Cheat",
        subtitle: "How to download and set up Valorant cheat",
        steps: [
          {
            title: "System Preparation",
            description: "Prepare your system for Vanguard bypass",
            instructions: [
              "Enable Secure Boot in BIOS",
              "Ensure TPM 2.0 is enabled",
              "Use Windows 11 for best compatibility",
            ],
          },
          {
            title: "Loader Download",
            description: "Download the Phantom loader",
            instructions: [
              "Download the loader from below",
              "Run BEFORE starting Valorant",
              "Wait for success message",
            ],
            downloadUrl: "https://discord.gg/magmacheats",
            downloadLabel: "Download Loader",
          },
        ],
      },
      {
        id: "arc-raiders",
        game: "Arc Raiders",
        slug: "arc-raiders",
        title: "Arc Raiders Cheat",
        subtitle: "How to download and set up Arc Raiders cheat",
        steps: [
          {
            title: "Loader Download",
            description: "Download the loader",
            instructions: [
              "Download from below",
              "Run as Administrator",
              "Follow on-screen instructions",
            ],
            downloadUrl: "https://discord.gg/magmacheats",
            downloadLabel: "Download Loader",
          },
        ],
      },
      
      {
        id: "bf6",
        game: "Battlefield 6",
        slug: "battlefield-6",
        title: "Battlefield 6 Cheat",
        subtitle: "How to download and set up Battlefield 6 cheat",
        steps: [
          {
            title: "Prerequisites",
            description: "System preparation",
            instructions: [
              "Disable Origin overlay",
              "Run game once before using cheat",
              "Close background applications",
            ],
          },
          {
            title: "Loader Download",
            description: "Download the BF6 loader",
            instructions: [
              "Download from below",
              "Extract and run as Administrator",
              "Inject after game fully loads",
            ],
            downloadUrl: "https://discord.gg/magmacheats",
            downloadLabel: "Download Loader",
          },
        ],
      },
    ],
  },
  {
    name: "HWID SPOOFERS",
    icon: "shield",
    guides: [
      {
        id: "temp-spoofer",
        game: "Temp Spoofer",
        slug: "temp-spoofer",
        title: "Temporary HWID Spoofer",
        subtitle: "Spoofs your hardware ID until restart",
        steps: [
          {
            title: "Download Spoofer",
            description: "Get the temporary spoofer",
            instructions: [
              "Download the spoofer from below",
              "Run as Administrator",
              "Spoof will last until PC restart",
            ],
            downloadUrl: "https://discord.gg/magmacheats",
            downloadLabel: "Download Temp Spoofer",
          },
        ],
      },
      {
        id: "perm-spoofer",
        game: "Perm Spoofer",
        slug: "perm-spoofer",
        title: "Permanent HWID Spoofer",
        subtitle: "Permanently changes your hardware ID",
        steps: [
          {
            title: "Preparation",
            description: "Prepare for permanent spoof",
            instructions: [
              "Create a system restore point",
              "Backup important data",
              "Ensure you have admin access",
            ],
          },
          {
            title: "Download Spoofer",
            description: "Get the permanent spoofer",
            instructions: [
              "Download the spoofer from below",
              "Run as Administrator",
              "Restart PC after spoofing",
            ],
            downloadUrl: "https://discord.gg/magmacheats",
            downloadLabel: "Download Perm Spoofer",
          },
        ],
      },
    ],
  },
];

export function getGuideBySlug(slug: string): Guide | undefined {
  for (const category of guideCategories) {
    const guide = category.guides.find((g) => g.slug === slug);
    if (guide) return guide;
  }
  return undefined;
}
