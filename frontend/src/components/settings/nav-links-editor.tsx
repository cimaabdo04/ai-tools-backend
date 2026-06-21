import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Plus, Trash2, ChevronUp, ChevronDown, ListCollapse } from "lucide-react";

interface NavLink {
  label: string;
  href: string;
  children?: NavLink[];
}

function parseLinks(json: string): NavLink[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function NavLinksEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const links = parseLinks(value);

  const setLinks = (items: NavLink[]) => {
    onChange(JSON.stringify(items));
  };

  const addLink = () => {
    setLinks([...links, { label: "", href: "/", children: [] }]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const moveLink = (index: number, dir: -1 | 1) => {
    const to = index + dir;
    if (to < 0 || to >= links.length) return;
    const copy = [...links];
    [copy[index], copy[to]] = [copy[to], copy[index]];
    setLinks(copy);
  };

  const updateLink = (index: number, field: keyof NavLink, val: string) => {
    const copy = [...links];
    copy[index] = { ...copy[index], [field]: val };
    setLinks(copy);
  };

  const addChild = (parentIndex: number) => {
    const copy = [...links];
    copy[parentIndex].children = [
      ...(copy[parentIndex].children || []),
      { label: "", href: "/" },
    ];
    setLinks(copy);
  };

  const removeChild = (parentIndex: number, childIndex: number) => {
    const copy = [...links];
    copy[parentIndex].children = (copy[parentIndex].children || []).filter(
      (_, i) => i !== childIndex
    );
    setLinks(copy);
  };

  const updateChild = (
    parentIndex: number,
    childIndex: number,
    field: keyof NavLink,
    val: string
  ) => {
    const copy = [...links];
    const children = [...(copy[parentIndex].children || [])];
    children[childIndex] = { ...children[childIndex], [field]: val };
    copy[parentIndex].children = children;
    setLinks(copy);
  };

  return (
    <div className="space-y-3">
      {links.map((link, i) => (
        <div key={i} className="space-y-2 rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <Input
              value={link.label}
              onChange={(e) => updateLink(i, "label", e.target.value)}
              placeholder="النص"
              className="flex-1"
            />
            <Input
              value={link.href}
              onChange={(e) => updateLink(i, "href", e.target.value)}
              placeholder="الرابط"
              className="flex-1"
              dir="ltr"
            />
            <Button variant="ghost" size="icon" onClick={() => moveLink(i, -1)} disabled={i === 0}>
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => moveLink(i, 1)} disabled={i === links.length - 1}>
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => addChild(i)} title="إضافة رابط فرعي">
              <ListCollapse className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => removeLink(i)} className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {link.children && link.children.length > 0 && (
            <div className="mr-6 space-y-2 border-r-2 pr-3">
              {link.children.map((child, j) => (
                <div key={j} className="flex items-center gap-2">
                  <Input
                    value={child.label}
                    onChange={(e) => updateChild(i, j, "label", e.target.value)}
                    placeholder="النص"
                    className="flex-1"
                  />
                  <Input
                    value={child.href}
                    onChange={(e) => updateChild(i, j, "href", e.target.value)}
                    placeholder="الرابط"
                    className="flex-1"
                    dir="ltr"
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeChild(i, j)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addLink} className="w-full">
        <Plus className="h-4 w-4 ml-2" />
        إضافة رابط
      </Button>
    </div>
  );
}
