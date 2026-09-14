import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { WeatherSnapshot } from '@/@types/weather';
import { formatTimeInZone, formatWeekdayInZone } from '@/utils/format-date';
import { getPlaceLabel } from '@/utils/format-place';
import { formatTemperature } from '@/utils/format-temperature';
import { getWeatherIcon } from '@/utils/weather-icon';

type WeatherCardProps = {
  snapshot: WeatherSnapshot;
};

export function WeatherCard({ snapshot }: WeatherCardProps) {
  const { colors } = useTheme();
  const { current, sun, daily, timezone } = snapshot;
  const ConditionIcon = getWeatherIcon(current.condition.weatherCode, current.condition.isDay);
  const place = getPlaceLabel(snapshot.place);
  const forecastItems = daily.slice(1, 6);

  return (
    <ThemedView
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}>
      <ThemedText type="subtitle" accessibilityRole="header">
        {place.title}
      </ThemedText>
      {place.country ? (
        <ThemedText
          type="small"
          themeColor="textSecondary"
          accessibilityLabel={place.countryAccessibilityLabel ?? undefined}>
          {place.country}
        </ThemedText>
      ) : null}

      <View style={styles.conditionRow}>
        <ConditionIcon
          size={48}
          color={colors.primary}
          accessibilityLabel={current.condition.label}
        />
        <View style={styles.conditionText}>
          <ThemedText type="title" style={styles.temperature}>
            {formatTemperature(current.temperatureC)}
          </ThemedText>
          <ThemedText type="default">{current.condition.label}</ThemedText>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        <MetricItem label="Sensação" value={formatTemperature(current.apparentTemperatureC)} />
        <MetricItem label="Umidade" value={`${Math.round(current.humidityPercent)}%`} />
        <MetricItem label="Vento" value={`${Math.round(current.windSpeedKmh)} km/h`} />
        <MetricItem label="Nascer" value={formatTimeInZone(sun.sunriseIso, timezone)} />
        <MetricItem label="Pôr" value={formatTimeInZone(sun.sunsetIso, timezone)} />
      </View>

      <ThemedText type="smallBold" style={styles.forecastTitle}>
        Previsão
      </ThemedText>
      <View style={styles.forecastList}>
        {forecastItems.map((item) => {
          const ForecastIcon = getWeatherIcon(item.weatherCode, true);

          return (
            <View key={item.dateIso} style={styles.forecastItem}>
              <ThemedText type="small" style={styles.forecastDay}>
                {formatWeekdayInZone(item.dateIso, timezone)}
              </ThemedText>
              <ForecastIcon
                size={20}
                color={colors.primary}
                accessibilityLabel="Condição prevista"
              />
              <ThemedText
                type="small"
                style={styles.forecastTemperature}
                accessibilityLabel={`Máxima de ${formatTemperature(item.temperatureMaxC)} e mínima de ${formatTemperature(item.temperatureMinC)}`}>
                {formatTemperature(item.temperatureMaxC)} / {formatTemperature(item.temperatureMinC)}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </ThemedView>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricItem}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="smallBold">{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  conditionText: {
    gap: Spacing.one,
  },
  temperature: {
    fontSize: 40,
    lineHeight: 44,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  metricItem: {
    width: '47%',
    gap: Spacing.half,
  },
  forecastTitle: {
    marginTop: Spacing.two,
  },
  forecastList: {
    gap: Spacing.two,
  },
  forecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  forecastDay: {
    flex: 1,
    textTransform: 'capitalize',
  },
  forecastTemperature: {
    flexShrink: 0,
    minWidth: 100,
    textAlign: 'right',
  },
});
