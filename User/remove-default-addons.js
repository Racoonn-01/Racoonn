const fs = require('fs');
const path = 'e:/Racoonn/User/src/components/checkout/CheckoutFlow.tsx';
let data = fs.readFileSync(path, 'utf8');

// Stop using DEFAULT_ADDONS for displayAddons
data = data.replace(
  'const displayAddons = propertyAddons === null ? [] : (propertyAddons.length > 0 ? propertyAddons : DEFAULT_ADDONS);',
  'const displayAddons = propertyAddons === null ? [] : propertyAddons;'
);

// We should hide the section if there are no addons
const originalAddonRender = `              ) : (
                <div id="addon-section" className={\`transition-all duration-700 rounded-2xl \${highlightAddonSection ? "ring-2 ring-brand-coral ring-offset-4 shadow-lg shadow-brand-coral/20" : ""}\`}>
                  <div 
                    className={\`grid transition-[grid-template-rows,opacity,margin] duration-500 ease-in-out \${highlightAddonSection ? 'grid-rows-[1fr] opacity-100 mb-6' : 'grid-rows-[0fr] opacity-0 mb-0'}\`}
                  >
                    <div className="overflow-hidden">
                      <div className="bg-brand-sky/20 border border-brand-sky/50 text-brand-navy px-4 py-3 rounded-xl flex items-start gap-3">
                        <Gem className="w-4 h-4 shrink-0 mt-0.5 text-brand-coral" />
                        <p className="text-xs md:text-sm leading-relaxed">
                          <strong className="font-semibold block mb-0.5 text-sm">Upgrade Your Experience</strong>
                          Add premium services below to make your stay truly memorable, or click <strong>Continue without Addons</strong> to proceed with your current selection.
                        </p>
                      </div>
                    </div>
                  </div>
                  <AddonSelector addons={displayAddons} guests={adults} />
                </div>
              )`;

const newAddonRender = `              ) : displayAddons.length > 0 ? (
                <div id="addon-section" className={\`transition-all duration-700 rounded-2xl \${highlightAddonSection ? "ring-2 ring-brand-coral ring-offset-4 shadow-lg shadow-brand-coral/20" : ""}\`}>
                  <div 
                    className={\`grid transition-[grid-template-rows,opacity,margin] duration-500 ease-in-out \${highlightAddonSection ? 'grid-rows-[1fr] opacity-100 mb-6' : 'grid-rows-[0fr] opacity-0 mb-0'}\`}
                  >
                    <div className="overflow-hidden">
                      <div className="bg-brand-sky/20 border border-brand-sky/50 text-brand-navy px-4 py-3 rounded-xl flex items-start gap-3">
                        <Gem className="w-4 h-4 shrink-0 mt-0.5 text-brand-coral" />
                        <p className="text-xs md:text-sm leading-relaxed">
                          <strong className="font-semibold block mb-0.5 text-sm">Upgrade Your Experience</strong>
                          Add premium services below to make your stay truly memorable, or click <strong>Continue without Addons</strong> to proceed with your current selection.
                        </p>
                      </div>
                    </div>
                  </div>
                  <AddonSelector addons={displayAddons} guests={adults} />
                </div>
              ) : null`;

data = data.replace(originalAddonRender, newAddonRender);

fs.writeFileSync(path, data, 'utf8');
console.log('Done');
