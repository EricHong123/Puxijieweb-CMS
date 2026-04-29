
import React from 'react';
import { Button } from '@/shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { MessageCircle, Mail } from 'lucide-react';
import { useLocale } from '@/shared/lib/useLocale.js';

function InquiryButton({ productName = '', className = '' }) {
  const locale = useLocale();
  const whatsappNumber = '+13532328175';
  const email = 'inquiry@puxijietech.com';
  const copy = {
    en: {
      button: 'Send Inquiry',
      choose: 'Choose contact method:',
      subject: productName ? `Inquiry about ${productName}` : 'Product Inquiry',
      message: productName
        ? `Hi, I'm interested in learning more about the ${productName}.`
        : 'Hi, I would like to inquire about your products.',
    },
    fr: {
      button: 'Envoyer une demande',
      choose: 'Choisissez un canal de contact :',
      subject: productName ? `Demande au sujet de ${productName}` : 'Demande produit',
      message: productName
        ? `Bonjour, je souhaite en savoir plus sur ${productName}.`
        : 'Bonjour, je souhaite obtenir des informations sur vos produits.',
    },
    vi: {
      button: 'Gửi yêu cầu',
      choose: 'Chọn phương thức liên hệ:',
      subject: productName ? `Yêu cầu về ${productName}` : 'Yêu cầu sản phẩm',
      message: productName
        ? `Xin chào, tôi muốn tìm hiểu thêm về ${productName}.`
        : 'Xin chào, tôi muốn hỏi thêm về sản phẩm của bạn.',
    },
  }[locale];
  const subject = copy.subject;
  const message = copy.message;

  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
  const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          size="lg" 
          className={`bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 ${className}`}
        >
          {copy.button}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 bg-card border-border">
        <div className="space-y-3">
          <p className="text-sm font-medium text-card-foreground">{copy.choose}</p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-all duration-200 active:scale-[0.98]"
          >
            <MessageCircle className="w-5 h-5 text-secondary-foreground" />
            <div>
              <p className="text-sm font-medium text-secondary-foreground">WhatsApp</p>
              <p className="text-xs text-secondary-foreground/70">{whatsappNumber}</p>
            </div>
          </a>
          <a
            href={emailUrl}
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-all duration-200 active:scale-[0.98]"
          >
            <Mail className="w-5 h-5 text-secondary-foreground" />
            <div>
              <p className="text-sm font-medium text-secondary-foreground">Email</p>
              <p className="text-xs text-secondary-foreground/70">{email}</p>
            </div>
          </a>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default InquiryButton;
