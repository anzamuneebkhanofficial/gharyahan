import Badge from "../ui/Badge";
import { formatDate, getDaysUntilVacancy } from "../../lib/utils";
import { Calendar, CheckCircle2, Clock, Lock } from "lucide-react";

export default function StatusBadge({
  status = "available",
  expectedVacancyDate = null,
  className,
}) {
  if (expectedVacancyDate) {
    const daysLeft = getDaysUntilVacancy(expectedVacancyDate);
    return (
      <Badge variant="vacancy" className={className}>
        <Calendar className="h-3 w-3 text-indigo-600" />
        <span>
          Vacancy: {formatDate(expectedVacancyDate)}
          {daysLeft && daysLeft > 0 ? ` (${daysLeft}d left)` : ""}
        </span>
      </Badge>
    );
  }

  if (status === "in_deal") {
    return (
      <Badge variant="indeal" className={className}>
        <Clock className="h-3 w-3 text-amber-600 animate-pulse" />
        <span>In Deal (Negotiating)</span>
      </Badge>
    );
  }

  if (status === "sealed") {
    return (
      <Badge variant="sealed" className={className}>
        <Lock className="h-3 w-3 text-slate-500" />
        <span>Sealed (Rented Out)</span>
      </Badge>
    );
  }

  return (
    <Badge variant="available" className={className}>
      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
      <span>Available Now</span>
    </Badge>
  );
}
