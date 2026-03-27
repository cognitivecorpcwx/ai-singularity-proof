"""Generate historical comparison chart for the Evidence Package."""
import os
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

OUT = os.environ.get("SINGULARITY_OUT", os.path.join(os.path.dirname(__file__), "..", "data", "output"))
os.makedirs(OUT, exist_ok=True)
NAVY = '#1B2A4A'
ACCENT = '#2E6BA6'
GREEN = '#27AE60'
LIGHT = '#F5F7FA'

plt.rcParams.update({
    'font.family': 'sans-serif', 'font.size': 11,
    'axes.facecolor': LIGHT, 'figure.facecolor': 'white',
    'grid.alpha': 0.3, 'grid.color': '#CCCCCC',
})

# Normalize all transitions to "years from start" and "% of capability range"
transitions = {
    "Electrification (1882-1956)": {
        "years": [0, 25, 38, 43, 54, 63, 74],
        "pct":   [0, 10, 35, 50, 70, 85, 96],
        "color": "#E67E22", "marker": "s", "lw": 2.5,
    },
    "Aviation (1903-1958)": {
        "years": [0, 6, 16, 24, 36, 44, 55],
        "pct":   [0, 5, 15, 25, 50, 75, 90],
        "color": "#9B59B6", "marker": "^", "lw": 2.5,
    },
    "Internet (1990-2015)": {
        "years": [0, 3, 5, 7, 10, 13, 17, 21, 25],
        "pct":   [0, 2, 14, 22, 43, 62, 75, 82, 87],
        "color": "#3498DB", "marker": "D", "lw": 2.5,
    },
    "Smartphones (2007-2020)": {
        "years": [0, 3, 4, 6, 8, 11, 13],
        "pct":   [3, 20, 35, 56, 68, 77, 82],
        "color": "#1ABC9C", "marker": "v", "lw": 2.5,
    },
    "AI Capability (2022-2026)": {
        "years": [0, 0.33, 1.17, 1.83, 2.58, 3.33],
        "pct":   [10, 35, 55, 70, 82, 90],
        "color": GREEN, "marker": "o", "lw": 4,
    },
}

fig, ax = plt.subplots(figsize=(14, 9))
fig.suptitle("Technology Phase Transitions: Normalized Capability Growth\nCognitive Corp | March 2026",
             fontsize=15, fontweight='bold', color=NAVY, y=0.97)

for name, data in transitions.items():
    t = np.array(data["years"])
    y = np.array(data["pct"])
    is_ai = "AI" in name
    ax.plot(t, y, marker=data["marker"], color=data["color"], linewidth=data["lw"],
            markersize=10 if is_ai else 7, label=name,
            alpha=1.0 if is_ai else 0.7, zorder=10 if is_ai else 5)

# Add reference lines
ax.axhline(y=10, color='#999', linestyle=':', linewidth=0.8, alpha=0.5)
ax.axhline(y=90, color='#999', linestyle=':', linewidth=0.8, alpha=0.5)
ax.text(72, 12, '10% threshold', fontsize=8, color='#999')
ax.text(72, 92, '90% threshold', fontsize=8, color='#999')

# Add duration annotations
ax.annotate('~40 years', xy=(49, 87), fontsize=9, color='#E67E22', fontweight='bold')
ax.annotate('~35 years', xy=(44, 77), fontsize=9, color='#9B59B6', fontweight='bold')
ax.annotate('~18 years', xy=(20, 85), fontsize=9, color='#3498DB', fontweight='bold')
ax.annotate('~10 years', xy=(11, 79), fontsize=9, color='#1ABC9C', fontweight='bold')
ax.annotate('~3 years', xy=(3.5, 92), fontsize=12, color=GREEN, fontweight='bold',
           bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor=GREEN, alpha=0.9))

ax.set_xlabel('Years from Start of Transition', fontsize=13)
ax.set_ylabel('% of Capability Range Achieved', fontsize=13)
ax.set_xlim(-2, 78)
ax.set_ylim(-5, 105)
ax.legend(loc='lower right', fontsize=10, framealpha=0.9)
ax.grid(True, alpha=0.3)

plt.tight_layout(rect=[0, 0, 1, 0.95])
path = f"{OUT}/Figure_5_Historical_Comparison.png"
plt.savefig(path, dpi=200, bbox_inches='tight')
plt.close()
print(f"Saved: {path}")
