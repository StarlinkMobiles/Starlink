declare module "react-snowfall" {
    import { ComponentType } from "react";

    interface SnowfallProps {
        color?: string | string[];
        snowflakeCount?: number;
        style?: React.CSSProperties;
    }

    const Snowfall: ComponentType<SnowfallProps>;
    export default Snowfall;
}
