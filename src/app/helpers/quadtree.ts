/**
 * A spatial data structure for efficient 2D position queries.
 * Used to optimize world generation by replacing linear searches with O(log n) spatial queries.
 */
export interface QuadtreePoint {
  x: number;
  y: number;
  taken: boolean;
}

export interface QuadtreeBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class Quadtree {
  private readonly MAX_POINTS = 10;
  private readonly MAX_LEVELS = 5;

  private level: number;
  private points: QuadtreePoint[] = [];
  private bounds: QuadtreeBounds;
  private nodes: (Quadtree | null)[] = [null, null, null, null];

  constructor(bounds: QuadtreeBounds, level = 0) {
    this.bounds = bounds;
  private readonly maxLevels: number;

  private level: number;
  private points: QuadtreePoint[] = [];
  private bounds: QuadtreeBounds;
  private nodes: (Quadtree | null)[] = [null, null, null, null];

  constructor(bounds: QuadtreeBounds, level = 0, maxLevels = 5) {
    this.bounds = bounds;
    this.level = level;
    this.maxLevels = maxLevels;
  }

  /**
   * Clear the quadtree
   */
  clear(): void {
    this.points = [];
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i] != null) {
        this.nodes[i]!.clear();
        this.nodes[i] = null;
      }
    }
  }

  /**
   * Split the node into 4 subnodes
   */
  private split(): void {
    const subWidth = this.bounds.width / 2;
    const subHeight = this.bounds.height / 2;
    const x = this.bounds.x;
    const y = this.bounds.y;

    this.nodes[0] = new Quadtree(
      { x: x + subWidth, y: y, width: subWidth, height: subHeight },
      this.level + 1
    );
    this.nodes[1] = new Quadtree(
      { x: x, y: y, width: subWidth, height: subHeight },
      this.level + 1
    );
    this.nodes[2] = new Quadtree(
      { x: x, y: y + subHeight, width: subWidth, height: subHeight },
      this.level + 1
    );
    this.nodes[3] = new Quadtree(
      { x: x + subWidth, y: y + subHeight, width: subWidth, height: subHeight },
      this.level + 1
    );
  }

  /**
   * Determine which node the point belongs to
   */
  private getIndex(point: QuadtreePoint): number {
    let index = -1;
    const verticalMidpoint = this.bounds.x + this.bounds.width / 2;
    const horizontalMidpoint = this.bounds.y + this.bounds.height / 2;

    // Point can completely fit within the top quadrants
    const topQuadrant = point.y < horizontalMidpoint && point.y >= this.bounds.y;
    // Point can completely fit within the bottom quadrants
    const bottomQuadrant = point.y >= horizontalMidpoint;

    // Point can completely fit within the left quadrants
    if (point.x < verticalMidpoint && point.x >= this.bounds.x) {
      if (topQuadrant) {
        index = 1;
      } else if (bottomQuadrant) {
        index = 2;
      }
    }
    // Point can completely fit within the right quadrants
    else if (point.x >= verticalMidpoint) {
      if (topQuadrant) {
        index = 0;
      } else if (bottomQuadrant) {
        index = 3;
      }
    }

    return index;
  }

  /**
   * Insert a point into the quadtree
   */
  insert(point: QuadtreePoint): void {
    // If point is outside bounds, don't insert
    if (!this.isInBounds(point)) {
      return;
    }

    // If we have child nodes, try to insert into them
    if (this.nodes[0] != null) {
      const index = this.getIndex(point);

      if (index !== -1) {
        this.nodes[index]!.insert(point);
        return;
      }
    }

    // Add to this node
    this.points.push(point);

    // If we have too many points and can still split, split
    if (this.points.length > this.MAX_POINTS && this.level < this.MAX_LEVELS) {
      if (this.nodes[0] == null) {
        this.split();
      }

      // Move all points to child nodes
      let i = 0;
      while (i < this.points.length) {
        const index = this.getIndex(this.points[i]);
        if (index !== -1) {
          this.nodes[index]!.insert(this.points.splice(i, 1)[0]);
        } else {
          i++;
        }
      }
    }
  }

  /**
   * Check if a point is within the bounds
   */
  private isInBounds(point: QuadtreePoint): boolean {
    return (
      point.x >= this.bounds.x &&
      point.x < this.bounds.x + this.bounds.width &&
      point.y >= this.bounds.y &&
      point.y < this.bounds.y + this.bounds.height
    );
  }

  /**
   * Check if two bounds intersect
   */
  private boundsIntersect(bounds: QuadtreeBounds): boolean {
    return !(
      bounds.x > this.bounds.x + this.bounds.width ||
      bounds.x + bounds.width < this.bounds.x ||
      bounds.y > this.bounds.y + this.bounds.height ||
      bounds.y + bounds.height < this.bounds.y
    );
  }

  /**
   * Retrieve all points within a given area
   */
  retrieve(bounds: QuadtreeBounds): QuadtreePoint[] {
    const returnObjects: QuadtreePoint[] = [];

    // If bounds don't intersect, return empty array
    if (!this.boundsIntersect(bounds)) {
      return returnObjects;
    }

    // Add points from this node that intersect with bounds
    for (const point of this.points) {
      if (
        point.x >= bounds.x &&
        point.x < bounds.x + bounds.width &&
        point.y >= bounds.y &&
        point.y < bounds.y + bounds.height
      ) {
        returnObjects.push(point);
      }
    }

    // If we have child nodes, retrieve from them too
    if (this.nodes[0] != null) {
      for (const node of this.nodes) {
        if (node != null) {
          returnObjects.push(...node.retrieve(bounds));
        }
      }
    }

    return returnObjects;
  }

  /**
   * Update a point's taken status
   */
  updatePoint(x: number, y: number, taken: boolean): void {
    const point = this.findPoint(x, y);
    if (point) {
      point.taken = taken;
    }
  }

  /**
   * Find a specific point in the quadtree
   */
  private findPoint(x: number, y: number): QuadtreePoint | null {
    // Search in current node
    for (const point of this.points) {
      if (point.x === x && point.y === y) {
        return point;
      }
    }

    // Search in child nodes
    if (this.nodes[0] != null) {
      const testPoint = { x, y, taken: false };
      const index = this.getIndex(testPoint);
      if (index !== -1) {
        return this.nodes[index]!.findPoint(x, y);
      } else {
        // Point might be in any child node if it's on a boundary
        for (const node of this.nodes) {
          if (node != null) {
            const found = node.findPoint(x, y);
            if (found) {
              return found;
            }
          }
        }
      }
    }

    return null;
  }

  /**
   * Get all points (for debugging/testing)
   */
  getAllPoints(): QuadtreePoint[] {
    const allPoints: QuadtreePoint[] = [...this.points];

    if (this.nodes[0] != null) {
      for (const node of this.nodes) {
        if (node != null) {
          allPoints.push(...node.getAllPoints());
        }
      }
    }

    return allPoints;
  }
}