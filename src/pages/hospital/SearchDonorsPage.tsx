import { useState } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BLOOD_GROUPS } from "@/lib/mock-data";
import { Donor } from "@/lib/types";

const donors: Donor[] = [];

export default function SearchDonorsPage() {
  const [filter, setFilter] = useState("all");

  const filtered = filter && filter !== "all" ? donors.filter((d) => d.bloodGroup === filter) : donors;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Search Donors</h1>
      <div className="mb-6 max-w-xs">
        <Label>Filter by Blood Group</Label>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger><SelectValue placeholder="All blood groups" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {BLOOD_GROUPS.map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <p className="text-muted-foreground col-span-full">No donors found.</p>
        )}
      </div>
    </div>
  );
}
