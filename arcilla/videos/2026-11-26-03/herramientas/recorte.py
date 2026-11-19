# recorta fondos blancos (relleno desde los bordes) y opcionalmente bases por color en una franja de abajo
import sys, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
import os, glob
# carpeta donde el conector de Recraft deja las vistas previas de esta sesión
SRC = os.environ.get('RECRAFT_DIR', (glob.glob('/tmp/claude-tool-results/*/') or ['/tmp/'])[0]) + 'mcp-Recraft-blob-%s.webp'
OUT = os.environ.get('OUT_DIR', '.') + '/%s.png'
def load(k): return np.array(Image.open(SRC % k).convert('RGB')).astype(float)
def keyed(a, tol=38, extra=None, crop=None):
    if crop: x0, y0, x1, y1 = crop; a = a[y0:y1, x0:x1]
    h, w, _ = a.shape
    white = (np.abs(a - 255).max(2) < tol) | ((a.min(2) > 200) & (a.max(2) - a.min(2) < 22))   # blanco y gris muy claro (sombras)
    if extra is not None: white |= extra(a)
    lab, _ = ndimage.label(white)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    alpha = (~bg).astype(float)
    alpha = ndimage.binary_opening(alpha > 0.5, iterations=2).astype(float)
    alpha = ndimage.gaussian_filter(alpha, 1.0)
    rgba = np.dstack([a, alpha * 255]).clip(0, 255).astype('uint8')
    im = Image.fromarray(rgba, 'RGBA'); bb = im.getbbox(); return im.crop(bb)
def hue_mask(lo, hi, smin=0.35, ymin=0.0):
    def f(a):
        import colorsys
        r, g, b = a[..., 0] / 255, a[..., 1] / 255, a[..., 2] / 255
        mx, mn = np.maximum(np.maximum(r, g), b), np.minimum(np.minimum(r, g), b)
        s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
        hh = np.zeros_like(mx); d = np.maximum(mx - mn, 1e-6)
        hh = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
        yy = np.arange(a.shape[0])[:, None] / a.shape[0]
        return (hh >= lo) & (hh <= hi) & (s >= smin) & (yy >= ymin)
    return f
jobs = {
  'botella-flask': ('1795096908086-jzb5gr-846abad2', {}),
  'botella': ('1795096924920-1m9vxb-bd50742f', {'extra': hue_mask(35, 55, 0.4, 0.45)}),
  'dusk': ('1795096965088-4xnohz-1a53c865', {}),
  'mesa': ('1795096971584-3u0zds-8ee189d5', {}),
  'amanecer': ('1795096978095-ntwv71-d85ab998', {}),
  'estrella': ('1795097010979-5t1k59-40f599ac', {'crop': (320, 0, 610, 180), 'extra': hue_mask(140, 220, 0.08)}),
  'caracola': ('1795097052798-fslint-72dc3b01', {'extra': hue_mask(25, 70, 0.3, 0.0)}),
  'farol': ('1795097058001-ulj7le-1948ebe7', {'extra': hue_mask(25, 70, 0.25, 0.74)}),
  'globo': ('1795097016343-6pb5xo-4507ef4b', {}),
  'senor': ('1795097047083-5bl6bu-652d9bff', {}),
}
for name, (k, o) in jobs.items():
    im = keyed(load(k), **o); im.save(OUT % name); print(name, im.size)
