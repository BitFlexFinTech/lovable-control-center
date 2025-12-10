import { X, ShoppingCart, Trash2, CreditCard } from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

export function CartDrawer() {
  const { items, removeFromCart, clearCart, total, itemCount } = useCart();

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-[10px] font-medium rounded-full flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Domain Cart
            </DrawerTitle>
            <DrawerDescription>
              {itemCount === 0 
                ? 'Your cart is empty' 
                : `${itemCount} domain${itemCount > 1 ? 's' : ''} pending purchase`
              }
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 py-2">
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No domains in cart</p>
                <p className="text-sm">Search for a domain to add it here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map(item => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border"
                  >
                    <div className="flex-1">
                      <p className="font-mono font-medium">{item.domain}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          ${item.price.toFixed(2)}/year
                        </span>
                        {item.isPremium && (
                          <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/30">
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon-sm"
                      onClick={() => removeFromCart(item.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <DrawerFooter>
              <div className="flex items-center justify-between mb-4 px-1">
                <span className="text-muted-foreground">Total</span>
                <span className="text-xl font-semibold">${total.toFixed(2)}/year</span>
              </div>
              <Button className="w-full gap-2">
                <CreditCard className="h-4 w-4" />
                Proceed to Checkout
              </Button>
              <Button variant="ghost" onClick={clearCart}>
                Clear Cart
              </Button>
            </DrawerFooter>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
