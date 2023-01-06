import { Box, Spacer, Text } from "@chakra-ui/react";
import { format } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DateAnalytics, TokenAnalytics } from "../../types/analytics";

interface ChartProps {
  data: TokenAnalytics[] | DateAnalytics[];
}

const Chart = ({ data }: ChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={450}>
      <AreaChart width={1000} height={150} data={data}>
        <CartesianGrid strokeDasharray={"3 3"} stroke="#454545" />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => format(new Date(v), "MMM dd")}
        />
        <YAxis tickFormatter={(v) => `$${v}`} />
        <Tooltip
          cursor={{ fill: "#ffffff", fillOpacity: 0.5 }}
          content={(props) => {
            return (
              props &&
              props.payload &&
              props.payload.length > 0 && (
                <Box
                  bg="brand.primary"
                  border="1px solid"
                  borderColor="brand.secondary"
                  px={4}
                  py={2}
                  rounded="xl"
                >
                  <Text>
                    {format(new Date(props.payload[0].payload.date), "MMM dd")}
                  </Text>

                  <Spacer mt={4} />

                  <Text>Number of sales: {props.payload[0].payload.count}</Text>

                  <Text color="#8884d8">
                    Total sales: {Number(props.payload[0].value).toFixed(2)}
                  </Text>
                  <Text color="#82ca9d">
                    Avg sales: {Number(props.payload[1].value).toFixed(2)}
                  </Text>
                </Box>
              )
            );
          }}
        />

        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#82ca9d" stopOpacity={0} />
          </linearGradient>
        </defs>

        <Area
          type="monotone"
          dataKey="avgInUSD"
          stroke="#82ca9d"
          fillOpacity={1}
          fill="url(#colorAvg)"
        />

        <Area
          type="monotone"
          dataKey="totalInUSD"
          stroke="#8884d8"
          fillOpacity={1}
          fill="url(#colorTotal)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default Chart;
