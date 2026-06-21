import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";

interface NavLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: NavLink[];
}

function parseSections(json: string): FooterSection[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function FooterLinksEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const sections = parseSections(value);

  const setSections = (items: FooterSection[]) => {
    onChange(JSON.stringify(items));
  };

  const addSection = () => {
    setSections([...sections, { title: "", links: [] }]);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const moveSection = (index: number, dir: -1 | 1) => {
    const to = index + dir;
    if (to < 0 || to >= sections.length) return;
    const copy = [...sections];
    [copy[index], copy[to]] = [copy[to], copy[index]];
    setSections(copy);
  };

  const updateSection = (index: number, val: string) => {
    const copy = [...sections];
    copy[index] = { ...copy[index], title: val };
    setSections(copy);
  };

  const addLink = (sectionIndex: number) => {
    const copy = [...sections];
    copy[sectionIndex].links = [...copy[sectionIndex].links, { label: "", href: "/" }];
    setSections(copy);
  };

  const removeLink = (sectionIndex: number, linkIndex: number) => {
    const copy = [...sections];
    copy[sectionIndex].links = copy[sectionIndex].links.filter((_, i) => i !== linkIndex);
    setSections(copy);
  };

  const updateLink = (sectionIndex: number, linkIndex: number, field: keyof NavLink, val: string) => {
    const copy = [...sections];
    const links = [...copy[sectionIndex].links];
    links[linkIndex] = { ...links[linkIndex], [field]: val };
    copy[sectionIndex].links = links;
    setSections(copy);
  };

  const moveLink = (sectionIndex: number, linkIndex: number, dir: -1 | 1) => {
    const copy = [...sections];
    const links = [...copy[sectionIndex].links];
    const to = linkIndex + dir;
    if (to < 0 || to >= links.length) return;
    [links[linkIndex], links[to]] = [links[to], links[linkIndex]];
    copy[sectionIndex].links = links;
    setSections(copy);
  };

  return (
    <div className="space-y-4">
      {sections.map((section, i) => (
        <div key={i} className="space-y-2 rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <Input
              value={section.title}
              onChange={(e) => updateSection(i, e.target.value)}
              placeholder="عنوان القسم"
              className="flex-1"
            />
            <Button variant="ghost" size="icon" onClick={() => moveSection(i, -1)} disabled={i === 0}>
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => moveSection(i, 1)} disabled={i === sections.length - 1}>
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => removeSection(i)} className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {section.links.map((link, j) => (
            <div key={j} className="mr-6 flex items-center gap-2">
              <Input
                value={link.label}
                onChange={(e) => updateLink(i, j, "label", e.target.value)}
                placeholder="النص"
                className="flex-1"
              />
              <Input
                value={link.href}
                onChange={(e) => updateLink(i, j, "href", e.target.value)}
                placeholder="الرابط"
                className="flex-1"
                dir="ltr"
              />
              <Button variant="ghost" size="icon" onClick={() => moveLink(i, j, -1)} disabled={j === 0}>
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => moveLink(i, j, 1)} disabled={j === section.links.length - 1}>
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => removeLink(i, j)} className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => addLink(i)} className="mr-6">
            <Plus className="h-4 w-4 ml-2" />
            إضافة رابط
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addSection} className="w-full">
        <Plus className="h-4 w-4 ml-2" />
        إضافة قسم
      </Button>
    </div>
  );
}
