
import React from 'react';
import { m } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

function TestCard({ test, index = 0 }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
    >
      {test.image && (
        <div className="aspect-video relative overflow-hidden bg-secondary/20">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 via-transparent to-transparent pointer-events-none" />
          <img
            src={test.image}
            alt={`${test.name} — Puxijie waterproof Bluetooth speaker testing and certification`}
            width={1600}
            height={900}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-bold text-card-foreground mb-2">
              {test.name}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {test.description}
            </p>
          </div>
        </div>
        
        {test.result && (
          <div className="pt-4 border-t border-border">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Test Result
            </p>
            <p className="text-lg font-semibold text-primary">
              {test.result}
            </p>
          </div>
        )}
        
        {test.certifications && test.certifications.length > 0 && (
          <div className="pt-4 border-t border-border">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Certifications
            </p>
            <div className="flex flex-wrap gap-2">
              {test.certifications.map((cert, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </m.div>
  );
}

export default TestCard;
