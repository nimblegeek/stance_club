import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center text-sm text-muted-foreground mb-2">
          <Link href="/" className="flex items-center hover:text-foreground">
            <Home className="h-4 w-4 mr-1" />
            Home
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center">
              <ChevronRight className="h-4 w-4 mx-1" />
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-foreground"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{crumb.label}</span>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Title and Description Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}