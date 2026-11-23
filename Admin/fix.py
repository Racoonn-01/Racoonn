import sys

filepath = r'e:\Racoonn\Admin\src\app\admin\dashboard\page.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if 'payments.documents.forEach(payment => {' in line:
        start_idx = i
    if 'properties.documents.forEach(p => {' in line:
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    new_logic = '''
    let currentPeriodBookings = 0;
    let previousPeriodBookings = 0;
    let totalRefund = 0;
    let currentPeriodRefund = 0;
    let previousPeriodRefund = 0;

    bookings.documents.forEach(b => {
      const date = new Date(b.);
      const isCancelled = b.status?.toLowerCase() === 'cancelled' || b.status?.toLowerCase() === 'canceled';
      const payment = payments.documents.find((p: any) => p.bookingId === b.);
      const property = properties.documents.find((p: any) => p. === b.hotelId);
      const vendorProfile = property ? vendors.documents.find((vp: any) => vp.userId === property.vendorId || vp.vendorId === property.vendorId) : null;

      let totalPaidNum = payment ? Number(payment.totalAmount) : (b.totalAmount ? Number(b.totalAmount) : (b.priceAfterTax ? Number(b.priceAfterTax) : 0));
      let baseRoomAmount = payment ? Number(payment.roomPrice) : (b.priceBeforeTax ? Number(b.priceBeforeTax) : 0);
      const addonsNum = payment ? Number(payment.serviceFees) : (b.addons ? Number(b.addons) : 0);
      const discountNum = payment ? Number(payment.discount) : (b.discount ? Number(b.discount) : 0);
      let taxes = payment ? Number(payment.taxes) : (b.gstAmount ? Number(b.gstAmount) : 0);

      let deducedRate = 18;
      if (!baseRoomAmount && totalPaidNum) {
        if (totalPaidNum <= 1000) deducedRate = 0;
        else if (totalPaidNum <= 7875) deducedRate = 5;
        else deducedRate = 18;
        baseRoomAmount = Math.round((totalPaidNum / (1 + deducedRate / 100)) * 100) / 100;
        taxes = Math.round((totalPaidNum - baseRoomAmount) * 100) / 100;
      }

      let vendorDiscount = 0;
      if (b.specialRequests) {
        const vdMatch = b.specialRequests.match(/VendorDiscount=₹?([0-9.]+)/);
        if (vdMatch) vendorDiscount = parseFloat(vdMatch[1]);
      } else {
        vendorDiscount = discountNum;
      }

      const vendorGross = baseRoomAmount + addonsNum - vendorDiscount;
      const feePercent = vendorProfile?.allow24PercentGst ? 24 : 18;
      const commission = Math.round(vendorGross * (feePercent / 100) * 100) / 100;

      if (!isCancelled) {
        if (isLifetime) {
          totalRevenue += totalPaidNum;
          totalCommission += commission;
          currentPeriodRevenue += totalPaidNum;
        } else {
          if (date >= currentPeriodStart) {
            currentPeriodRevenue += totalPaidNum;
            totalRevenue += totalPaidNum;
            totalCommission += commission;
          } else if (date >= previousPeriodStart && date <= previousPeriodEnd) {
            previousPeriodRevenue += totalPaidNum;
            previousPeriodCommission += commission;
          }
        }

        // Chart aggregation
        let key = "";
        if (filter === 'today') key = date.getHours() + ":00";
        else if (filter === 'weekly') key = date.toLocaleDateString('en-US', { weekday: 'short' });
        else if (filter === 'monthly') key = date.getDate().toString();
        else key = monthNames[date.getMonth()];
        
        if (!chartDataMap[key]) chartDataMap[key] = 0;
        if (isLifetime || date >= currentPeriodStart) {
            chartDataMap[key] += totalPaidNum;
        }
      } else {
        const checkInRaw = b.checkIn || b.checkInDate || b.rawCheckIn;
        const cancelledAtRaw = b.cancelledAt || b.updatedAt || b.;
        let refundAmt = 0;

        if (checkInRaw) {
          const checkInDate = new Date(checkInRaw);
          const cancelledDate = new Date(cancelledAtRaw);
          const hoursUntilCheckIn = (checkInDate.getTime() - cancelledDate.getTime()) / (1000 * 60 * 60);

          if (hoursUntilCheckIn >= 48) refundAmt = totalPaidNum;
          else if (hoursUntilCheckIn >= 24) refundAmt = totalPaidNum * 0.8;
          else if (hoursUntilCheckIn < 24 && hoursUntilCheckIn > 0) refundAmt = 0;
          else refundAmt = totalPaidNum;
        } else {
          refundAmt = totalPaidNum;
        }

        totalRefund += refundAmt;
        if (isLifetime || date >= currentPeriodStart) {
          currentPeriodRefund += refundAmt;
        } else if (date >= previousPeriodStart && date <= previousPeriodEnd) {
          previousPeriodRefund += refundAmt;
        }
      }

      if (isLifetime || date >= currentPeriodStart) currentPeriodBookings++;
      else if (date >= previousPeriodStart && date <= previousPeriodEnd) previousPeriodBookings++;
    });

'''
    
    lines[start_idx:end_idx] = [new_logic]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Replaced logic!")
else:
    print("Could not find boundaries", start_idx, end_idx)
