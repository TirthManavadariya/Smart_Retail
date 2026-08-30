import { useCallback, useRef, useState, type DragEvent, type ReactNode } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Crosshair,
  Gauge,
  ImageUp,
  Layers,
  PackageSearch,
  RotateCcw,
  ScanLine,
  Sparkles,
  Timer,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { pct } from '@/lib/format';
import { tone, type Tone } from '@/lib/status';
import { useToast } from '@/hooks/useToast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { ErrorState } from '@/components/ui/States';
import type { DetectionResult } from '@/lib/types';

const SAMPLES = [
  { file: 'shelf_full_shelf.png', label: 'Full shelf' },
  { file: 'shelf_low_stock_shelf.png', label: 'Low stock' },
  { file: 'shelf_empty_sections.png', label: 'Empty sections' },
  { file: 'shelf_misplaced_products.png', label: 'Misplaced' },
];

type ViewMode = 'overlay' | 'annotated' | 'original';

/**
 * Upload a shelf photo and run it through the YOLOv8 endpoint.
 *
 * The detection overlay is drawn client-side from the returned bboxes as
 * percentage-positioned boxes over the original image, which makes each
 * detection hoverable and linkable to its row in the list. The server's own
 * annotated JPEG is still available as a comparison view.
 */
export function ShelfScanner() {
  const { push } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('overlay');
  const [activeClass, setActiveClass] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const detect = useMutation({
    mutationFn: (file: File) => api.detect(file),
    onSuccess: (result) => {
      push({
        kind: 'success',
        title: 'Inference complete',
        message: `${result.num_products} products detected in ${result.processing_time_ms.toFixed(0)} ms.`,
      });
    },
    onError: (error: Error) => {
      push({ kind: 'error', title: 'Inference failed', message: error.message });
    },
  });

  const run = useCallback(
    (file: File) => {
      setFileName(file.name);
      setActiveClass(null);
      setViewMode('overlay');
      detect.mutate(file);
    },
    [detect],
  );

  const loadSample = useCallback(
    async (name: string) => {
      try {
        const response = await fetch(`/sample-images/${name}`);
        if (!response.ok) throw new Error(`Sample image unavailable (${response.status})`);
        const blob = await response.blob();
        run(new File([blob], name, { type: blob.type || 'image/png' }));
      } catch (error) {
        push({
          kind: 'error',
          title: 'Could not load sample',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
    [run, push],
  );

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      push({ kind: 'warning', title: 'Unsupported file', message: 'Drop an image file (JPG or PNG).' });
      return;
    }
    run(file);
  };

  const result = detect.data;

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="xl:col-span-2 space-y-6">
        {!result && !detect.isPending && (
          <Card>
            <CardHeader
              title="Shelf image inference"
              subtitle="Runs the YOLOv8 detector on the backend and returns per-facing detections"
              icon={<ScanLine className="size-4" />}
            />
            <CardBody>
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={cn(
                  'flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors',
                  dragging ? 'border-primary bg-primary/5' : 'border-line',
                )}
              >
                <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <ImageUp className="size-6" />
                </span>
                <div>
                  <p className="font-display text-sm font-bold text-content">
                    Drop a shelf photo here
                  </p>
                  <p className="mt-1 text-xs text-content-muted">JPG or PNG, up to about 10 MB</p>
                </div>

                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) run(file);
                    event.target.value = '';
                  }}
                />
                <Button
                  variant="primary"
                  size="md"
                  icon={<PackageSearch className="size-4" />}
                  onClick={() => inputRef.current?.click()}
                >
                  Select image
                </Button>

                <div className="mt-2 w-full border-t border-line pt-4">
                  <p className="mb-2.5 text-2xs font-bold uppercase tracking-wider text-content-faint">
                    Or try a generated sample
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {SAMPLES.map((sample) => (
                      <Button key={sample.file} onClick={() => void loadSample(sample.file)}>
                        {sample.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {detect.isPending && (
          <Card>
            <CardBody className="flex flex-col items-center justify-center gap-4 py-20">
              <span className="relative grid size-16 place-items-center">
                <span className="absolute size-16 rounded-full border-2 border-primary/20" />
                <span className="absolute size-16 animate-spin rounded-full border-2 border-transparent border-t-primary" />
                <Sparkles className="size-6 text-primary" />
              </span>
              <div className="text-center">
                <p className="font-display text-sm font-bold text-content">Running inference</p>
                <p className="mt-1 max-w-sm text-xs text-content-muted">
                  The first request also loads the model into memory, so it can take a while.
                </p>
              </div>
            </CardBody>
          </Card>
        )}

        {detect.error && !detect.isPending && (
          <Card>
            <CardBody>
              <ErrorState error={detect.error} onRetry={() => detect.reset()} />
            </CardBody>
          </Card>
        )}

        {result && (
          <Card>
            <CardHeader
              title={fileName || 'Detection result'}
              subtitle={`${result.image_width} × ${result.image_height} px`}
              action={
                <>
                  <Tabs
                    size="sm"
                    value={viewMode}
                    onChange={setViewMode}
                    items={[
                      { id: 'overlay', label: 'Overlay' },
                      { id: 'annotated', label: 'Server' },
                      { id: 'original', label: 'Original' },
                    ]}
                  />
                  <Button
                    icon={<RotateCcw className="size-3.5" />}
                    onClick={() => {
                      detect.reset();
                      setFileName('');
                    }}
                  >
                    New scan
                  </Button>
                </>
              }
            />
            <CardBody className="p-4">
              <DetectionViewer
                result={result}
                viewMode={viewMode}
                activeClass={activeClass}
                hoveredId={hoveredId}
                onHover={setHoveredId}
              />
            </CardBody>
          </Card>
        )}
      </div>

      {/* ── Right rail: metrics + detection list ───────────────────────── */}
      <div className="space-y-6">
        {result ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <MiniStat
                icon={<PackageSearch className="size-4" />}
                label="Products"
                value={String(result.num_products)}
                tone="primary"
              />
              <MiniStat
                icon={<Gauge className="size-4" />}
                label="Confidence"
                value={pct(result.avg_confidence * 100)}
                tone="success"
              />
              <MiniStat
                icon={<Crosshair className="size-4" />}
                label="Stockout gaps"
                value={String(result.stockout_gaps)}
                tone={result.stockout_gaps > 0 ? 'danger' : 'success'}
              />
              <MiniStat
                icon={<Timer className="size-4" />}
                label="Inference"
                value={`${result.processing_time_ms.toFixed(0)} ms`}
                tone="violet"
              />
            </div>

            <Card>
              <CardHeader
                title="Detected facings"
                subtitle="Hover a row to locate it in the image"
                icon={<Layers className="size-4" />}
                action={
                  <Badge variant="primary">{result.detections.length}</Badge>
                }
              />
              <CardBody className="p-3">
                {/* Class filter chips */}
                <div className="mb-3 flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setActiveClass(null)}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-2xs font-semibold transition-colors',
                      activeClass === null
                        ? 'bg-primary text-primary-on'
                        : 'bg-surface-high text-content-muted hover:text-content',
                    )}
                  >
                    All
                  </button>
                  {Object.entries(result.class_counts).map(([label, count]) => (
                    <button
                      key={label}
                      onClick={() => setActiveClass(activeClass === label ? null : label)}
                      className={cn(
                        'rounded-full px-2.5 py-1 text-2xs font-semibold transition-colors',
                        activeClass === label
                          ? 'bg-primary text-primary-on'
                          : 'bg-surface-high text-content-muted hover:text-content',
                      )}
                    >
                      {label} · {count}
                    </button>
                  ))}
                </div>

                <ul className="max-h-[26rem] space-y-1.5 overflow-y-auto pr-1">
                  {result.detections
                    .filter((item) => activeClass === null || item.label === activeClass)
                    .map((item) => (
                      <li
                        key={item.id}
                        onMouseEnter={() => setHoveredId(item.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={cn(
                          'flex items-center gap-2.5 rounded-lg border p-2 transition-colors',
                          hoveredId === item.id
                            ? 'border-primary/50 bg-primary/10'
                            : 'border-transparent bg-surface-mid/50',
                        )}
                      >
                        <span className="tnum grid size-6 shrink-0 place-items-center rounded bg-surface-high font-mono text-[0.6rem] font-bold text-content-muted">
                          {item.id}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-semibold text-content">
                            {item.label}
                          </span>
                          <span className="block truncate font-mono text-[0.6rem] text-content-faint">
                            {item.bbox.map((value) => Math.round(value)).join(', ')}
                          </span>
                        </span>
                        <ConfidencePill value={item.confidence} />
                      </li>
                    ))}
                </ul>
              </CardBody>
            </Card>
          </>
        ) : (
          <Card>
            <CardHeader title="How this works" icon={<Sparkles className="size-4" />} />
            <CardBody className="space-y-3 text-xs leading-relaxed text-content-muted">
              <p>
                The image is posted to <code className="font-mono text-primary">/api/detect</code>, where
                the YOLOv8 detector returns a bounding box, class and confidence per product facing.
              </p>
              <p>
                Facing counts are compared against the planogram to derive stockout gaps and a
                compliance score. Detections below the confidence threshold are discarded server-side.
              </p>
              <ul className="space-y-1.5 pt-1">
                {[
                  'Overlay view draws boxes from the raw coordinates',
                  'Server view shows the backend-rendered annotation',
                  'Class chips filter both the list and the overlay',
                ].map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
                    {line}
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}

function DetectionViewer({
  result,
  viewMode,
  activeClass,
  hoveredId,
  onHover,
}: {
  result: DetectionResult;
  viewMode: ViewMode;
  activeClass: string | null;
  hoveredId: number | null;
  onHover: (id: number | null) => void;
}) {
  const visible = result.detections.filter(
    (item) => activeClass === null || item.label === activeClass,
  );

  if (viewMode === 'annotated') {
    return (
      <img
        src={result.annotated_image}
        alt="Shelf image with detections annotated by the server"
        className="w-full rounded-xl"
      />
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-black">
      <img
        src={result.original_image}
        alt="Uploaded shelf photograph"
        className="block w-full"
      />

      {viewMode === 'overlay' &&
        visible.map((item) => {
          const [x, y, width, height] = item.bbox;
          const dim = hoveredId !== null && hoveredId !== item.id;
          return (
            <div
              key={item.id}
              onMouseEnter={() => onHover(item.id)}
              onMouseLeave={() => onHover(null)}
              className={cn(
                'absolute rounded border-2 transition-all duration-150',
                hoveredId === item.id
                  ? 'border-white shadow-[0_0_0_2px_rgba(0,0,0,0.55)]'
                  : 'border-white/80',
                dim && 'opacity-25',
              )}
              style={{
                left: `${(x / result.image_width) * 100}%`,
                top: `${(y / result.image_height) * 100}%`,
                width: `${(width / result.image_width) * 100}%`,
                height: `${(height / result.image_height) * 100}%`,
                background: 'rgb(255 255 255 / 0.14)',
              }}
            >
              <span
                className={cn(
                  'absolute -top-[1.1rem] left-0 whitespace-nowrap rounded bg-primary px-1 font-mono text-[0.55rem] font-bold text-primary-on',
                  hoveredId === item.id ? 'opacity-100' : 'opacity-0',
                )}
              >
                #{item.id} {item.label} {(item.confidence * 100).toFixed(0)}%
              </span>
            </div>
          );
        })}

      <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded-lg bg-black/70 px-2.5 py-1.5 backdrop-blur">
        <span className="size-1.5 rounded-full bg-danger" />
        <span className="font-mono text-[0.6rem] font-bold uppercase tracking-wider text-white">
          {viewMode === 'overlay' ? `${visible.length} boxes` : 'original'}
        </span>
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
  tone: toneName,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: Tone;
}) {
  return (
    <div className="glass rounded-xl p-3">
      {/* Literal class strings — Tailwind can't see interpolated names */}
      <div className={cn('mb-2', tone[toneName].text)}>{icon}</div>
      <p className="text-[0.6rem] font-bold uppercase tracking-wider text-content-faint">{label}</p>
      <p className="tnum mt-0.5 font-display text-lg font-extrabold text-content">{value}</p>
    </div>
  );
}

function ConfidencePill({ value }: { value: number }) {
  const percent = value * 100;
  const variant = percent >= 90 ? 'success' : percent >= 75 ? 'warn' : 'danger';
  return (
    <Badge variant={variant} className="shrink-0 tnum">
      {percent.toFixed(0)}%
    </Badge>
  );
}
