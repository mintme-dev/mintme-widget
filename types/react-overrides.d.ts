import type React from "react"
import "react"

declare module "react" {
  type FunctionComponent<P = {}> = (props: P, context?: any) => React.ReactElement<any, any> | null

  type FC<P = {}> = (props: P, context?: any) => React.ReactElement<any, any> | null
}
